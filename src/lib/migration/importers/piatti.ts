// Importatore per Piatti

import type { Payload } from 'payload'
import type { BackendPiatto, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importPiatti(
  backendPiatti: BackendPiatto[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Piatti (${backendPiatti.length})...`)

  const stats: MigrationStats = {
    collection: 'piatti',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const piatto of backendPiatti) {
    try {
      // Il backend restituisce categoria come oggetto popolato
      const backendCategoriaId = piatto.categoria?.id || piatto.categoriaId
      const categoriaId = backendCategoriaId ? idMap.get('categoria-piatti', backendCategoriaId) : undefined

      if (!categoriaId) {
        console.error(
          `   ⚠️  Categoria non trovata per piatto ${piatto.nome} (categoriaId: ${backendCategoriaId})`,
        )
        stats.errors++
        continue
      }

      // Mappa gli allergeni
      const allergeniIds: (string | number)[] = []
      if (piatto.allergeni && piatto.allergeni.length > 0) {
        for (const allergene of piatto.allergeni) {
          const allergeneId = idMap.get('allergeni', allergene.id)
          if (allergeneId) {
            allergeniIds.push(allergeneId)
          }
        }
      }

      const created = await payload.create({
        collection: 'piatti',
        data: {
          nome: piatto.nome,
          descrizione: piatto.descrizione || '',
          prezzo: Number(piatto.prezzo),
          inLista: piatto.inLista !== undefined ? piatto.inLista : true,
          glutenFree: piatto.glutenFree || false,
          noUovo: piatto.noUovo || false,
          noLatticini: piatto.noLatticini || false,
          vegan: piatto.vegan || false,
          soloMenuFissi: piatto.soloMenuFissi || false,
          categoria: categoriaId as number,
          allergeni: allergeniIds as number[],
          _status: 'published',
        },
      })

      idMap.set('piatti', piatto.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando piatto ${piatto.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Piatti: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
