// Importatore per Menu Fisso

import type { Payload } from 'payload'
import type { BackendMenuFisso, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

// Tipo per la struttura junction table dell'API
interface JunctionTablePiatto {
  id?: string | number // ID della junction table (NON usare!)
  piattoId?: string | number // ID del piatto (usare questo)
  piatto?: { id: string | number } // Oggetto nested (alternativa)
}

interface JunctionTableServizio {
  id?: string | number // ID della junction table (NON usare!)
  servizioAccessorioId?: string | number // ID del servizio (usare questo)
  servizioAccessorio?: { id: string | number } // Oggetto nested (alternativa)
}

// Helper per estrarre l'ID del piatto dalla struttura junction table
function extractPiattoId(item: unknown): number | string | undefined {
  const junction = item as JunctionTablePiatto
  // Prima prova piattoId (ID diretto)
  if (junction.piattoId !== undefined) {
    return junction.piattoId
  }
  // Poi prova piatto.id (nested)
  if (junction.piatto?.id !== undefined) {
    return junction.piatto.id
  }
  // Fallback: se è un formato diretto senza junction table
  if ('id' in (item as object) && !('piattoId' in (item as object))) {
    return (item as { id: string | number }).id
  }
  return undefined
}

// Helper per estrarre l'ID del servizio dalla struttura junction table
function extractServizioId(item: unknown): number | string | undefined {
  const junction = item as JunctionTableServizio
  // Prima prova servizioAccessorioId (ID diretto)
  if (junction.servizioAccessorioId !== undefined) {
    return junction.servizioAccessorioId
  }
  // Poi prova servizioAccessorio.id (nested)
  if (junction.servizioAccessorio?.id !== undefined) {
    return junction.servizioAccessorio.id
  }
  // Fallback: se è un formato diretto senza junction table
  if ('id' in (item as object) && !('servizioAccessorioId' in (item as object))) {
    return (item as { id: string | number }).id
  }
  return undefined
}

export async function importMenuFisso(
  backendMenuFissi: BackendMenuFisso[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Menu Fisso (${backendMenuFissi.length})...`)

  const stats: MigrationStats = {
    collection: 'menu-fisso',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const menu of backendMenuFissi) {
    try {
      // Il backend restituisce categoria come oggetto popolato
      const backendCategoriaId = menu.categoria?.id || menu.categoriaId
      const categoriaId = backendCategoriaId ? idMap.get('categoria-menu-fisso', backendCategoriaId) : undefined

      if (!categoriaId) {
        console.error(
          `   ⚠️  Categoria non trovata per menu fisso ${menu.nome} (categoriaId: ${backendCategoriaId})`,
        )
        stats.errors++
        continue
      }

      // Mappa i piatti - gestisce struttura junction table
      const piattiIds: (string | number)[] = []
      if (menu.piatti && menu.piatti.length > 0) {
        for (const item of menu.piatti) {
          const backendId = extractPiattoId(item)
          if (backendId !== undefined) {
            const piattoId = idMap.get('piatti', backendId)
            if (piattoId) {
              piattiIds.push(piattoId)
            }
          }
        }
      }

      // Mappa i servizi - gestisce struttura junction table
      const serviziIds: (string | number)[] = []
      if (menu.servizi && menu.servizi.length > 0) {
        for (const item of menu.servizi) {
          const backendId = extractServizioId(item)
          if (backendId !== undefined) {
            const servizioId = idMap.get('servizi-accessori', backendId)
            if (servizioId) {
              serviziIds.push(servizioId)
            }
          }
        }
      }

      const created = await payload.create({
        collection: 'menu-fisso',
        data: {
          nome: menu.nome,
          descrizione: menu.descrizione || '',
          prezzo: Number(menu.prezzo),
          inLista: menu.inLista !== undefined ? menu.inLista : true,
          categoria: categoriaId as number,
          piatti: piattiIds as number[],
          servizi: serviziIds as number[],
          _status: 'published',
        },
      })

      idMap.set('menu-fisso', menu.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando menu fisso ${menu.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Menu Fisso: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
