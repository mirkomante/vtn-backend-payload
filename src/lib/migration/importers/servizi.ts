// Importatore per Servizi Accessori

import type { Payload } from 'payload'
import type { BackendServizioAccessorio, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importServiziAccessori(
  backendServizi: BackendServizioAccessorio[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Servizi Accessori (${backendServizi.length})...`)

  const stats: MigrationStats = {
    collection: 'servizi-accessori',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const servizio of backendServizi) {
    try {
      const created = await payload.create({
        collection: 'servizi-accessori',
        data: {
          nome: servizio.nome,
          descrizione: servizio.descrizione || '',
          prezzo: Number(servizio.prezzo),
          inLista: servizio.inLista !== undefined ? servizio.inLista : true,
          _status: 'published',
        },
      })

      idMap.set('servizi-accessori', servizio.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando servizio ${servizio.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Servizi Accessori: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
