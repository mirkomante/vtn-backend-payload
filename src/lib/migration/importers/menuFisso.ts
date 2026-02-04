// Importatore per Menu Fisso

import type { Payload } from 'payload'
import type { BackendMenuFisso, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

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

      // Mappa i piatti
      const piattiIds: (string | number)[] = []
      if (menu.piatti && menu.piatti.length > 0) {
        for (const piatto of menu.piatti) {
          const piattoId = idMap.get('piatti', piatto.id)
          if (piattoId) {
            piattiIds.push(piattoId)
          }
        }
      }

      // Mappa i servizi
      const serviziIds: (string | number)[] = []
      if (menu.servizi && menu.servizi.length > 0) {
        for (const servizio of menu.servizi) {
          const servizioId = idMap.get('servizi-accessori', servizio.id)
          if (servizioId) {
            serviziIds.push(servizioId)
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
