/**
 * Smart Webhook Hook - Sistema di aggiornamento intelligente per disponibilita.json
 * 
 * Pattern "Traffic Cop": analizza i cambiamenti nei documenti e decide tra:
 * - Fast Path: Rigenera disponibilita.json (cambio inLista o collezioni impostazioni)
 * - Slow Path: Invia messaggio Pub/Sub per rebuild completo (cambio campi pesanti)
 * 
 * @see https://cloud.google.com/storage/docs/uploading-objects
 * @see https://cloud.google.com/pubsub/docs/publisher
 */

import type { CollectionAfterChangeHook, CollectionSlug, PayloadRequest } from 'payload'
import { Storage } from '@google-cloud/storage'
import { PubSub } from '@google-cloud/pubsub'

// =============================================================================
// CONFIGURAZIONE COLLEZIONI
// =============================================================================

/**
 * Collezioni del gruppo "Menu" - Filtrare per inLista: true
 * Contengono i prodotti/servizi visibili nel menu pubblico
 */
const MENU_COLLECTIONS: CollectionSlug[] = [
  'piatti',
  'vini',
  'birre',
  'cocktail',
  'liquori',
  'bevande',
  'menu-fisso',
]

/**
 * Collezioni del gruppo "Impostazioni" - Recuperare TUTTI i documenti pubblicati
 * Contengono dati di decodifica/configurazione (categorie, tipologie, allergeni)
 */
const SETTINGS_COLLECTIONS: CollectionSlug[] = [
  'allergeni',
  'categoria-piatti',
  'categoria-menu-fisso',
  'tipologie-vino',
  'tipologie-birra',
  'tipologie-liquore',
  'tipologie-cocktail',
  'tipologie-bevanda',
  'servizi-accessori',
]

/**
 * Campi "pesanti" che triggerano il Slow Path (rebuild completo)
 * Include: nome, descrizione, prezzo, e tutti i campi relationship
 */
const HEAVY_FIELDS = [
  'nome',
  'descrizione',
  'prezzo',
  'prezzoCalice',
  // Relazioni (trigger rebuild per cambi strutturali)
  'categoria',
  'tipologia',
  'allergeni',
  'piatti',
  'servizi',
  'nazione',
  'regione',
  'zona',
]

// =============================================================================
// CONFIGURAZIONE AMBIENTE
// =============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const GCS_BUCKET = process.env.GCS_FRONTEND_BUCKET || ''
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || ''
const PUBSUB_TOPIC = 'rebuild-menu'
const OUTPUT_FILENAME = 'disponibilita.json'

// =============================================================================
// CLIENT GCP (Singleton - inizializzati solo in produzione)
// =============================================================================

let storageClient: Storage | null = null
let pubsubClient: PubSub | null = null

/**
 * Inizializza i client GCP solo quando necessario (lazy initialization)
 */
function getGCPClients() {
  if (!IS_PRODUCTION) {
    return { storage: null, pubsub: null }
  }

  if (!storageClient && GCS_BUCKET) {
    storageClient = new Storage({
      projectId: GCP_PROJECT_ID,
    })
  }

  if (!pubsubClient && GCP_PROJECT_ID) {
    pubsubClient = new PubSub({
      projectId: GCP_PROJECT_ID,
    })
  }

  return { storage: storageClient, pubsub: pubsubClient }
}

// =============================================================================
// TIPI
// =============================================================================

type ChangeType = 'fast-path' | 'slow-path' | 'none'

interface ChangeAnalysis {
  type: ChangeType
  reason: string
  changedFields: string[]
}

// =============================================================================
// ANALISI CAMBIAMENTI (Traffic Cop Logic)
// =============================================================================

/**
 * Analizza i cambiamenti tra doc e previousDoc per determinare il percorso da seguire
 * 
 * Fast Path: inLista changed OR settings collection
 * Slow Path: heavy fields changed (nome, descrizione, prezzo, relazioni)
 */
function detectChangeType(
  collection: CollectionSlug,
  doc: any,
  previousDoc: any,
  operation: string,
): ChangeAnalysis {
  const isSettingsCollection = SETTINGS_COLLECTIONS.includes(collection)
  const isMenuCollection = MENU_COLLECTIONS.includes(collection)

  // Nuova creazione -> Fast Path (aggiungi al JSON)
  if (operation === 'create') {
    return {
      type: 'fast-path',
      reason: 'Nuovo documento creato',
      changedFields: ['*'],
    }
  }

  // Collezione non coinvolta -> skip
  if (!isSettingsCollection && !isMenuCollection) {
    return {
      type: 'none',
      reason: 'Collezione non monitorata',
      changedFields: [],
    }
  }

  // Collezione impostazioni -> sempre Fast Path (decodifiche)
  if (isSettingsCollection) {
    return {
      type: 'fast-path',
      reason: 'Collezione impostazioni modificata',
      changedFields: Object.keys(doc).filter((key) => doc[key] !== previousDoc?.[key]),
    }
  }

  // Analizza campi modificati
  const changedFields: string[] = []
  let inListaChanged = false
  let heavyFieldsChanged = false

  for (const key of Object.keys(doc)) {
    const currentValue = doc[key]
    const previousValue = previousDoc?.[key]

    // Skip campi di sistema
    if (key.startsWith('_') || key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      continue
    }

    // Confronto valori (gestisce anche array e oggetti)
    const hasChanged = JSON.stringify(currentValue) !== JSON.stringify(previousValue)

    if (hasChanged) {
      changedFields.push(key)

      if (key === 'inLista') {
        inListaChanged = true
      }

      if (HEAVY_FIELDS.includes(key)) {
        heavyFieldsChanged = true
      }
    }
  }

  // Decisione finale
  if (inListaChanged) {
    return {
      type: 'fast-path',
      reason: 'Campo inLista modificato',
      changedFields,
    }
  }

  if (heavyFieldsChanged) {
    return {
      type: 'slow-path',
      reason: 'Campi pesanti modificati (nome, descrizione, prezzo, relazioni)',
      changedFields,
    }
  }

  // Cambiamenti minori (es. flag booleani, date) -> Fast Path
  if (changedFields.length > 0) {
    return {
      type: 'fast-path',
      reason: 'Campi minori modificati',
      changedFields,
    }
  }

  return {
    type: 'none',
    reason: 'Nessun cambiamento rilevante',
    changedFields: [],
  }
}

// =============================================================================
// AGGREGAZIONE DATI
// =============================================================================

/**
 * Definisce i campi da selezionare per ogni collezione (ottimizzazione query)
 */
const COLLECTION_FIELDS: Record<string, Record<string, boolean>> = {
  // Menu Collections
  piatti: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    categoria: true,
    inLista: true,
    glutenFree: true,
    noUovo: true,
    noLatticini: true,
    vegan: true,
    allergeni: true,
    soloMenuFissi: true,
    _status: true,
  },
  vini: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    prezzoCalice: true,
    tipologia: true,
    nazione: true,
    regione: true,
    zona: true,
    cantina: true,
    grado: true,
    capacita: true,
    anno: true,
    certificazione: true,
    inLista: true,
    _status: true,
  },
  birre: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    tipologia: true,
    nazione: true,
    grado: true,
    capacita: true,
    inLista: true,
    _status: true,
  },
  cocktail: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    tipologia: true,
    nazione: true,
    inLista: true,
    _status: true,
  },
  liquori: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    tipologia: true,
    nazione: true,
    grado: true,
    capacita: true,
    invecchiamento: true,
    inLista: true,
    _status: true,
  },
  bevande: {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    tipologia: true,
    nazione: true,
    inLista: true,
    _status: true,
  },
  'menu-fisso': {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    categoria: true,
    piatti: true,
    servizi: true,
    inLista: true,
    _status: true,
  },

  // Settings Collections
  allergeni: {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'categoria-piatti': {
    id: true,
    nome: true,
    descrizione: true,
    inLista: true,
    _status: true,
  },
  'categoria-menu-fisso': {
    id: true,
    nome: true,
    descrizione: true,
    inLista: true,
    _status: true,
  },
  'tipologie-vino': {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'tipologie-birra': {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'tipologie-liquore': {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'tipologie-cocktail': {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'tipologie-bevanda': {
    id: true,
    nome: true,
    descrizione: true,
    _status: true,
  },
  'servizi-accessori': {
    id: true,
    nome: true,
    descrizione: true,
    prezzo: true,
    inLista: true,
    _status: true,
  },
}

/**
 * Aggrega dati da tutte le collezioni coinvolte
 * Menu collections: filtra per inLista: true
 * Settings collections: prende tutti i documenti pubblicati
 */
async function aggregateData(req: PayloadRequest): Promise<Record<string, any[]>> {
  const { payload } = req
  const result: Record<string, any[]> = {}

  // Query parallele per tutte le collezioni
  const queries = [
    // Menu Collections (con filtro inLista)
    ...MENU_COLLECTIONS.map(async (slug) => {
      try {
        const { docs } = await payload.find({
          collection: slug,
          where: {
            and: [{ _status: { equals: 'published' } }, { inLista: { equals: true } }],
          },
          limit: 0, // Tutti i documenti
          depth: 1, // Popola relazioni di primo livello
          select: COLLECTION_FIELDS[slug] || {},
          req, // Mantiene la transazione
        })
        return { slug, docs }
      } catch (error) {
        console.error(`❌ Errore query ${slug}:`, error)
        return { slug, docs: [] }
      }
    }),

    // Settings Collections (tutti i documenti pubblicati)
    ...SETTINGS_COLLECTIONS.map(async (slug) => {
      try {
        const { docs } = await payload.find({
          collection: slug,
          where: {
            _status: { equals: 'published' },
          },
          limit: 0,
          depth: 0, // Non serve popolare relazioni
          select: COLLECTION_FIELDS[slug] || {},
          req,
        })
        return { slug, docs }
      } catch (error) {
        console.error(`❌ Errore query ${slug}:`, error)
        return { slug, docs: [] }
      }
    }),
  ]

  // Esegui tutte le query in parallelo
  const results = await Promise.all(queries)

  // Costruisci l'oggetto risultato
  for (const { slug, docs } of results) {
    result[slug] = docs
  }

  return result
}

// =============================================================================
// UPLOAD GCS
// =============================================================================

/**
 * Carica il JSON aggregato su Google Cloud Storage
 * Cache-Control: public, max-age=0 per forzare revalidation
 */
async function uploadToGCS(data: Record<string, any[]>): Promise<void> {
  const { storage } = getGCPClients()

  if (!storage || !GCS_BUCKET) {
    throw new Error('GCS non configurato (manca GCS_FRONTEND_BUCKET o GCP_PROJECT_ID)')
  }

  const bucket = storage.bucket(GCS_BUCKET)
  const file = bucket.file(OUTPUT_FILENAME)

  const jsonContent = JSON.stringify(data, null, 2)

  await file.save(jsonContent, {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=0',
    },
    resumable: false, // File piccolo, upload diretto
  })

  console.log(`✅ Upload GCS completato: gs://${GCS_BUCKET}/${OUTPUT_FILENAME}`)
}

// =============================================================================
// PUB/SUB
// =============================================================================

/**
 * Invia messaggio Pub/Sub per triggerare rebuild completo del menu
 */
async function sendPubSubMessage(
  collection: CollectionSlug,
  docId: string | number,
  changedFields: string[],
): Promise<void> {
  const { pubsub } = getGCPClients()

  if (!pubsub || !GCP_PROJECT_ID) {
    throw new Error('Pub/Sub non configurato (manca GCP_PROJECT_ID)')
  }

  const topic = pubsub.topic(PUBSUB_TOPIC)

  const message = {
    event: 'rebuild-menu',
    collection,
    docId: String(docId),
    changedFields,
    timestamp: new Date().toISOString(),
  }

  const messageBuffer = Buffer.from(JSON.stringify(message))
  const messageId = await topic.publishMessage({ data: messageBuffer })

  console.log(`📤 Messaggio Pub/Sub inviato: ${messageId} (topic: ${PUBSUB_TOPIC})`)
}

// =============================================================================
// HOOK PRINCIPALE
// =============================================================================

/**
 * Hook afterChange che implementa la logica "Traffic Cop"
 * 
 * Uso:
 * ```typescript
 * import { createSmartWebhook } from '../hooks/smartWebhook'
 * 
 * export const Piatti: CollectionConfig = {
 *   slug: 'piatti',
 *   hooks: {
 *     afterChange: [createSmartWebhook()],
 *   },
 * }
 * ```
 */
export function createSmartWebhook(): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation, collection }) => {
    const timestamp = new Date().toISOString()
    const collectionSlug = collection.slug

    // Skip se siamo in un context che vuole evitare il webhook (prevenzione loop)
    if (req.context?.skipSmartWebhook) {
      console.log(`⏭️  [${timestamp}] Smart Webhook skipped per context flag`)
      return doc
    }

    console.log(
      `\n🚦 [${timestamp}] Smart Webhook triggered: ${collectionSlug}/${doc.id} (${operation})`,
    )

    // Analizza il tipo di cambiamento
    const analysis = detectChangeType(collectionSlug, doc, previousDoc, operation)

    console.log(`   Analisi: ${analysis.type} - ${analysis.reason}`)
    if (analysis.changedFields.length > 0 && analysis.changedFields[0] !== '*') {
      console.log(`   Campi modificati: ${analysis.changedFields.join(', ')}`)
    }

    // Nessun cambiamento rilevante -> skip
    if (analysis.type === 'none') {
      console.log(`   ✅ Nessuna azione necessaria\n`)
      return doc
    }

    // DEVELOPMENT MODE: Mock delle operazioni GCP
    if (!IS_PRODUCTION) {
      console.log(`   🔧 [DEV MODE] Mock attivo - nessuna operazione GCP reale`)

      if (analysis.type === 'fast-path') {
        console.log(`   📦 [MOCK] Aggregazione dati da ${MENU_COLLECTIONS.length + SETTINGS_COLLECTIONS.length} collezioni`)
        console.log(`   ☁️  [MOCK] Upload su gs://${GCS_BUCKET || 'NOT_CONFIGURED'}/${OUTPUT_FILENAME}`)
      }

      if (analysis.type === 'slow-path') {
        console.log(`   📤 [MOCK] Invio messaggio Pub/Sub al topic: ${PUBSUB_TOPIC}`)
        console.log(`   📤 [MOCK] Payload: ${JSON.stringify({ collection: collectionSlug, docId: doc.id, changedFields: analysis.changedFields })}`)
      }

      console.log(`   ✅ Mock completato\n`)
      return doc
    }

    // PRODUCTION MODE: Operazioni reali
    try {
      if (analysis.type === 'fast-path') {
        console.log(`   🚀 Fast Path: Rigenero disponibilita.json...`)

        // Aggrega dati
        const aggregatedData = await aggregateData(req)

        // Conta totale documenti
        const totalDocs = Object.values(aggregatedData).reduce(
          (sum, docs) => sum + docs.length,
          0,
        )
        console.log(`   📦 Dati aggregati: ${totalDocs} documenti totali`)

        // Upload su GCS
        await uploadToGCS(aggregatedData)
        console.log(`   ✅ Fast Path completato\n`)
      }

      if (analysis.type === 'slow-path') {
        console.log(`   🐌 Slow Path: Invio messaggio Pub/Sub...`)

        await sendPubSubMessage(collectionSlug, doc.id, analysis.changedFields)
        console.log(`   ✅ Slow Path completato\n`)
      }
    } catch (error) {
      // Log errore ma non bloccare l'operazione
      console.error(`   ❌ Errore durante ${analysis.type}:`, error)
      console.error(`   ⚠️  L'operazione sul documento è comunque completata\n`)
    }

    return doc
  }
}
