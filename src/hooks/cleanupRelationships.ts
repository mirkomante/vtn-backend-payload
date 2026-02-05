/**
 * Hook per la pulizia automatica delle referenze quando un documento viene eliminato.
 * Previene le "dangling references" (referenze orfane) nel database.
 */

import type { CollectionBeforeDeleteHook, CollectionSlug, PayloadRequest } from 'payload'

interface CleanupConfig {
  /** Collection che contiene la referenza da pulire */
  targetCollection: CollectionSlug
  /** Nome del campo relationship nella collection target */
  relationshipField: string
}

/**
 * Rimuove un ID da un campo relationship (hasMany) in tutti i documenti della collection target.
 * Usato negli hook beforeDelete per mantenere l'integrità referenziale.
 */
async function removeFromRelationship(
  req: PayloadRequest,
  deletedId: number | string,
  config: CleanupConfig,
): Promise<void> {
  const { payload } = req

  try {
    // Trova tutti i documenti che referenziano l'ID da eliminare
    const { docs } = await payload.find({
      collection: config.targetCollection,
      where: {
        [config.relationshipField]: {
          contains: deletedId,
        },
      },
      limit: 0, // Tutti i documenti
      depth: 0, // Non caricare relazioni annidate
    })

    if (docs.length === 0) return

    // Aggiorna ogni documento rimuovendo la referenza
    for (const doc of docs) {
      const currentValues = (doc as unknown as Record<string, unknown>)[config.relationshipField] as
        | (number | string)[]
        | null

      if (!currentValues || !Array.isArray(currentValues)) continue

      // Filtra l'ID eliminato
      const newValues = currentValues.filter((id) => {
        // Gestisce sia ID numerici che stringhe
        const currentId = typeof id === 'object' && id !== null ? (id as { id: number | string }).id : id
        return currentId !== deletedId && String(currentId) !== String(deletedId)
      })

      // Aggiorna solo se c'è stata una modifica
      if (newValues.length !== currentValues.length) {
        await payload.update({
          collection: config.targetCollection,
          id: doc.id,
          data: {
            [config.relationshipField]: newValues,
          },
          req, // Mantiene la transazione
        })

        console.log(
          `🧹 Rimossa referenza a ${deletedId} da ${config.targetCollection}/${doc.id}.${config.relationshipField}`,
        )
      }
    }
  } catch (error) {
    console.error(`Errore durante la pulizia delle referenze in ${config.targetCollection}:`, error)
    // Non blocchiamo l'eliminazione in caso di errore nella pulizia
  }
}

/**
 * Crea un hook beforeDelete che pulisce le referenze nella collection target.
 *
 * @example
 * // In Piatti.ts - rimuove il piatto da menu-fisso.piatti quando viene eliminato
 * hooks: {
 *   beforeDelete: [
 *     createCleanupHook({ targetCollection: 'menu-fisso', relationshipField: 'piatti' })
 *   ]
 * }
 */
export function createCleanupHook(config: CleanupConfig): CollectionBeforeDeleteHook {
  return async ({ req, id }) => {
    await removeFromRelationship(req, id, config)
  }
}

/**
 * Crea un hook beforeDelete che pulisce le referenze in multiple collections.
 *
 * @example
 * // In Allergene.ts - rimuove l'allergene da piatti.allergeni quando viene eliminato
 * hooks: {
 *   beforeDelete: [
 *     createMultiCleanupHook([
 *       { targetCollection: 'piatti', relationshipField: 'allergeni' }
 *     ])
 *   ]
 * }
 */
export function createMultiCleanupHook(configs: CleanupConfig[]): CollectionBeforeDeleteHook {
  return async ({ req, id }) => {
    for (const config of configs) {
      await removeFromRelationship(req, id, config)
    }
  }
}
