// Funzione per pulire i dati esistenti in Payload (eccetto users)

import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

/**
 * Collections da pulire prima della migrazione
 * Ordine inverso rispetto all'importazione per rispettare le dipendenze
 */
const COLLECTIONS_TO_CLEAN: CollectionSlug[] = [
  // Prima le entità che dipendono da altre
  'menu-fisso',
  'piatti',
  'vini',
  'birre',
  'liquori',
  'cocktail',
  'bevande',
  'servizi-accessori',

  // Poi le entità intermedie
  'allergeni',
  'categoria-piatti',
  'categoria-menu-fisso',
  'zone',
  'regioni',

  // Infine le entità base
  'tipologie-vino',
  'tipologie-birra',
  'tipologie-liquore',
  'tipologie-cocktail',
  'tipologie-bevanda',
  'nazioni',
]

/**
 * Elimina tutti i documenti da una collection
 */
async function cleanCollection(payload: Payload, collection: CollectionSlug): Promise<number> {
  try {
    let totalDeleted = 0
    let hasMore = true

    // Elimina in batch per evitare problemi di memoria
    while (hasMore) {
      const { docs } = await payload.find({
        collection,
        limit: 100,
        depth: 0,
      })

      if (docs.length === 0) {
        hasMore = false
        break
      }

      // Elimina i documenti trovati
      for (const doc of docs) {
        try {
          await payload.delete({
            collection,
            id: doc.id,
          })
          totalDeleted++
        } catch (error) {
          console.error(`   ⚠️  Errore eliminando documento ${doc.id} da ${collection}:`, error)
        }
      }

      // Se abbiamo trovato meno di 100 documenti, abbiamo finito
      if (docs.length < 100) {
        hasMore = false
      }
    }

    return totalDeleted
  } catch (error) {
    console.error(`   ❌ Errore durante la pulizia di ${collection}:`, error)
    return 0
  }
}

/**
 * Pulisce tutti i dati esistenti in Payload (eccetto users)
 */
export async function cleanExistingData(payload: Payload): Promise<{
  success: boolean
  collectionsCleared: number
  documentsDeleted: number
  errors: string[]
}> {
  console.log('🧹 Pulizia dati esistenti...')

  const errors: string[] = []
  let totalDeleted = 0
  let collectionsCleared = 0

  for (const collection of COLLECTIONS_TO_CLEAN) {
    try {
      console.log(`   Pulizia collection: ${collection}`)
      const deleted = await cleanCollection(payload, collection)

      if (deleted > 0) {
        console.log(`   ✅ ${collection}: ${deleted} documenti eliminati`)
        totalDeleted += deleted
        collectionsCleared++
      } else {
        console.log(`   ℹ️  ${collection}: nessun documento da eliminare`)
      }
    } catch (error) {
      const errorMsg = `Errore durante la pulizia di ${collection}: ${error}`
      console.error(`   ❌ ${errorMsg}`)
      errors.push(errorMsg)
    }
  }

  console.log('✅ Pulizia completata')
  console.log(`   - Collections pulite: ${collectionsCleared}`)
  console.log(`   - Documenti eliminati: ${totalDeleted}`)

  if (errors.length > 0) {
    console.log(`   ⚠️  Errori: ${errors.length}`)
  }

  return {
    success: errors.length === 0,
    collectionsCleared,
    documentsDeleted: totalDeleted,
    errors,
  }
}
