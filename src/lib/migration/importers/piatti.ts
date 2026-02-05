// Importatore per Piatti

import type { Payload } from 'payload'
import type { BackendPiatto, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

// Tipo per la struttura junction table dell'API per allergeni
interface JunctionTableAllergene {
  id?: string | number // ID della junction table (NON usare!)
  allergeneId?: string | number // ID dell'allergene (usare questo)
  allergene?: { id: string | number } // Oggetto nested (alternativa)
}

// Helper per estrarre l'ID dell'allergene dalla struttura junction table
function extractAllergeneId(item: unknown): number | string | undefined {
  const junction = item as JunctionTableAllergene
  // Prima prova allergeneId (ID diretto)
  if (junction.allergeneId !== undefined) {
    return junction.allergeneId
  }
  // Poi prova allergene.id (nested)
  if (junction.allergene?.id !== undefined) {
    return junction.allergene.id
  }
  // Fallback: se è un formato diretto senza junction table
  if ('id' in (item as object) && !('allergeneId' in (item as object))) {
    return (item as { id: string | number }).id
  }
  return undefined
}

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

      // Mappa gli allergeni - gestisce struttura junction table
      const allergeniIds: (string | number)[] = []
      if (piatto.allergeni && piatto.allergeni.length > 0) {
        for (const item of piatto.allergeni) {
          const backendId = extractAllergeneId(item)
          if (backendId !== undefined) {
            const allergeneId = idMap.get('allergeni', backendId)
            if (allergeneId) {
              allergeniIds.push(allergeneId)
            }
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
