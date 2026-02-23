/**
 * Smart Webhook Hook - Sistema di aggiornamento intelligente per disponibilita.json
 *
 * Pattern "Traffic Cop": analizza i cambiamenti nei documenti e decide tra:
 * - Fast Path: Rigenera il JSON del target interessato (cambio inLista o collezioni impostazioni)
 * - Slow Path: Invia messaggio Pub/Sub per rebuild completo (cambio campi pesanti)
 *
 * Architettura Multi-Frontend: ogni frontend ha il suo bucket GCS dedicato e riceve
 * solo i dati delle collezioni pertinenti, definiti in FRONTEND_TARGETS.
 *
 * @see https://cloud.google.com/storage/docs/uploading-objects
 * @see https://cloud.google.com/pubsub/docs/publisher
 */

import type { CollectionAfterChangeHook, CollectionSlug, PayloadRequest } from 'payload'
import { Storage } from '@google-cloud/storage'
import { PubSub } from '@google-cloud/pubsub'

// =============================================================================
// CONFIGURAZIONE MULTI-FRONTEND (FRONTEND_TARGETS)
// =============================================================================

/**
 * Definisce un target frontend con il suo bucket GCS dedicato e le collezioni di pertinenza.
 * Estendibile: aggiungere nuovi target (es. 'corporate', 'shop') senza toccare la logica core.
 */
type FrontendTarget = {
  id: string
  bucketEnv: string
  filename: string
  collections: string[]
}

/**
 * Mappa dei target frontend attivi.
 * Ogni target definisce:
 * - bucketEnv: nome della variabile d'ambiente che contiene il nome del bucket GCS
 * - filename: nome del file JSON da generare nel bucket
 * - collections: slug delle collezioni Payload da includere nel JSON
 */
const FRONTEND_TARGETS: FrontendTarget[] = [
  {
    id: 'menu',
    bucketEnv: 'GCS_MENU_BUCKET',
    filename: 'disponibilita.json',
    collections: [
      'piatti',
      'vini',
      'birre',
      'cocktail',
      'liquori',
      'bevande',
      'menu-fisso',
      'allergeni',
      'categoria-piatti',
      'categoria-menu-fisso',
      'tipologie-vino',
      'tipologie-birra',
      'tipologie-liquore',
      'tipologie-cocktail',
      'tipologie-bevanda',
      'servizi-accessori',
    ],
  },
  // Futuri target: 'corporate', 'shop', ecc.
]

// =============================================================================
// CONFIGURAZIONE COLLEZIONI (per logica Traffic Cop)
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
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || ''
const PUBSUB_TOPIC = 'rebuild-menu'

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

  if (!storageClient && GCP_PROJECT_ID) {
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

  // Collezione non coinvolta in nessun target -> skip
  if (!isSettingsCollection && !isMenuCollection) {
    console.log(`🔥 DEBUG: detectChangeType → none (collezione "${collection}" non è in MENU_COLLECTIONS né SETTINGS_COLLECTIONS)`)
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

  console.log(`🔥 DEBUG: detectChangeType → none (nessun campo rilevante cambiato tra doc e previousDoc)`)
  console.log(`🔥 DEBUG: Tutti i campi confrontati: [${Object.keys(doc).filter(k => !k.startsWith('_') && k !== 'id' && k !== 'createdAt' && k !== 'updatedAt').join(', ')}]`)
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
 * Aggrega dati dalle collezioni specificate per un determinato target frontend.
 * Menu collections: filtra per inLista: true
 * Settings collections: prende tutti i documenti pubblicati
 */
async function aggregateDataForTarget(
  req: PayloadRequest,
  targetCollections: string[],
): Promise<Record<string, any[]>> {
  const { payload } = req
  const result: Record<string, any[]> = {}

  const queries = targetCollections.map(async (slug) => {
    const isMenu = MENU_COLLECTIONS.includes(slug as CollectionSlug)
    const isSettings = SETTINGS_COLLECTIONS.includes(slug as CollectionSlug)

    if (!isMenu && !isSettings) {
      return { slug, docs: [] }
    }

    try {
      const { docs } = await payload.find({
        collection: slug as CollectionSlug,
        where: isMenu
          ? { and: [{ _status: { equals: 'published' } }, { inLista: { equals: true } }] }
          : { _status: { equals: 'published' } },
        limit: 0,
        depth: isMenu ? 1 : 0,
        select: COLLECTION_FIELDS[slug] || {},
        req,
      })
      return { slug, docs }
    } catch (error) {
      console.error(`❌ Errore query ${slug}:`, error)
      return { slug, docs: [] }
    }
  })

  const results = await Promise.all(queries)

  for (const { slug, docs } of results) {
    result[slug] = docs
  }

  return result
}

// =============================================================================
// UPLOAD GCS (per target specifico)
// =============================================================================

/**
 * Carica il JSON aggregato su Google Cloud Storage nel bucket del target specificato.
 * Cache-Control: public, max-age=0 per forzare revalidation
 */
async function uploadToGCSTarget(
  data: Record<string, any[]>,
  target: FrontendTarget,
): Promise<void> {
  const { storage } = getGCPClients()
  const bucketName = process.env[target.bucketEnv]

  if (!storage) {
    throw new Error('GCS Storage client non inizializzato (manca GCP_PROJECT_ID)')
  }

  if (!bucketName) {
    throw new Error(
      `Variabile d'ambiente ${target.bucketEnv} non configurata per il target "${target.id}"`,
    )
  }

  const bucket = storage.bucket(bucketName)
  const file = bucket.file(target.filename)

  const jsonContent = JSON.stringify(data, null, 2)
  console.log(`🔥 DEBUG: uploadToGCSTarget - bucket: "${bucketName}", file: "${target.filename}", dimensione JSON: ${jsonContent.length} bytes`)
  console.log(`🔥 DEBUG: uploadToGCSTarget - collezioni nel payload: [${Object.keys(data).map(k => `${k}(${data[k].length})`).join(', ')}]`)

  await file.save(jsonContent, {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=0',
    },
    resumable: false,
  })

  console.log(`✅ Upload GCS completato: gs://${bucketName}/${target.filename} (target: ${target.id})`)
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
// ROUTING MULTI-TARGET
// =============================================================================

/**
 * Identifica i target frontend interessati dalla modifica di una collezione.
 * Restituisce solo i target che includono la collezione modificata.
 */
function getAffectedTargets(collectionSlug: string): FrontendTarget[] {
  return FRONTEND_TARGETS.filter((target) => target.collections.includes(collectionSlug))
}

// =============================================================================
// HOOK PRINCIPALE
// =============================================================================

/**
 * Hook afterChange che implementa la logica "Traffic Cop" con routing multi-frontend.
 *
 * Per ogni modifica a una collezione monitorata:
 * 1. Determina il tipo di cambiamento (fast-path / slow-path / none)
 * 2. Identifica i target frontend interessati (tramite FRONTEND_TARGETS)
 * 3. Per ogni target interessato:
 *    - Fast Path: aggrega i dati delle collezioni del target e carica il JSON nel suo bucket
 *    - Slow Path: invia messaggio Pub/Sub per rebuild completo
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

    // --- DEBUG ENTRY POINT ---
    console.log(`🔥 DEBUG: Hook avviato! Collection: ${collectionSlug}, Operation: ${operation}, ID: ${doc.id}`)
    console.log(`🔥 DEBUG: Env Vars - NODE_ENV: ${process.env.NODE_ENV}, GCS_MENU_BUCKET: ${process.env.GCS_MENU_BUCKET || '(non impostata)'}`)
    console.log(`🔥 DEBUG: _status doc corrente: ${doc._status ?? '(assente)'}, _status previousDoc: ${previousDoc?._status ?? '(assente/nessun previousDoc)'}`)
    console.log(`🔥 DEBUG: skipSmartWebhook context flag: ${req.context?.skipSmartWebhook ?? false}`)

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
    console.log(`🔥 DEBUG: Change analysis result: type="${analysis.type}", reason="${analysis.reason}", changedFields=[${analysis.changedFields.join(', ')}]`)
    if (analysis.changedFields.length > 0 && analysis.changedFields[0] !== '*') {
      console.log(`   Campi modificati: ${analysis.changedFields.join(', ')}`)
    }

    // Nessun cambiamento rilevante -> skip
    if (analysis.type === 'none') {
      console.log(`🔥 DEBUG: Uscita con type=none - nessuna azione GCP verrà eseguita`)
      console.log(`   ✅ Nessuna azione necessaria\n`)
      return doc
    }

    // Identifica i target frontend interessati da questa collezione
    const affectedTargets = getAffectedTargets(collectionSlug)

    if (affectedTargets.length === 0) {
      console.log(`   ⚠️  Nessun target frontend configurato per la collezione "${collectionSlug}"\n`)
      return doc
    }

    console.log(`   🎯 Target interessati: ${affectedTargets.map((t) => t.id).join(', ')}`)

    // DEVELOPMENT MODE: Mock delle operazioni GCP
    if (!IS_PRODUCTION) {
      console.log(`   🔧 [DEV MODE] Mock attivo - nessuna operazione GCP reale`)

      for (const target of affectedTargets) {
        const bucketName = process.env[target.bucketEnv] || 'NOT_CONFIGURED'

        if (analysis.type === 'fast-path') {
          console.log(
            `   📦 [MOCK][${target.id}] Aggregazione dati da ${target.collections.length} collezioni`,
          )
          console.log(
            `   ☁️  [MOCK][${target.id}] Upload su gs://${bucketName}/${target.filename}`,
          )
        }

        if (analysis.type === 'slow-path') {
          console.log(`   📤 [MOCK][${target.id}] Invio messaggio Pub/Sub al topic: ${PUBSUB_TOPIC}`)
          console.log(
            `   📤 [MOCK][${target.id}] Payload: ${JSON.stringify({ collection: collectionSlug, docId: doc.id, changedFields: analysis.changedFields })}`,
          )
        }
      }

      console.log(`   ✅ Mock completato\n`)
      return doc
    }

    // PRODUCTION MODE: Operazioni reali per ogni target interessato
    for (const target of affectedTargets) {
      try {
        if (analysis.type === 'fast-path') {
          console.log(`🔥 DEBUG: Entrando nel blocco Fast Path per target "${target.id}"...`)
          console.log(`   🚀 Fast Path [${target.id}]: Rigenero ${target.filename}...`)

          // Verifica che la variabile d'ambiente del bucket sia configurata
          const bucketName = process.env[target.bucketEnv]
          console.log(`🔥 DEBUG: Tentativo upload su bucket: ${bucketName || `(${target.bucketEnv} non impostata)`}`)
          if (!bucketName) {
            console.warn(
              `   ⚠️  [${target.id}] Variabile d'ambiente ${target.bucketEnv} non impostata - skip target`,
            )
            continue
          }

          // Aggrega dati solo per le collezioni di questo target
          const aggregatedData = await aggregateDataForTarget(req, target.collections)

          const totalDocs = Object.values(aggregatedData).reduce(
            (sum, docs) => sum + docs.length,
            0,
          )
          console.log(`   📦 [${target.id}] Dati aggregati: ${totalDocs} documenti totali`)

          // Upload nel bucket dedicato al target
          await uploadToGCSTarget(aggregatedData, target)
          console.log(`   ✅ Fast Path [${target.id}] completato`)
        }

        if (analysis.type === 'slow-path') {
          console.log(`   🐌 Slow Path [${target.id}]: Invio messaggio Pub/Sub...`)

          await sendPubSubMessage(collectionSlug, doc.id, analysis.changedFields)
          console.log(`   ✅ Slow Path [${target.id}] completato`)
        }
      } catch (error) {
        // Log errore per questo target ma continua con gli altri (graceful skip)
        console.error(`   ❌ Errore durante ${analysis.type} per target "${target.id}":`, error)
        console.error(`   ⚠️  Gli altri target e l'operazione sul documento continuano normalmente`)
      }
    }

    console.log()
    return doc
  }
}
