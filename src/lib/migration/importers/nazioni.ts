// Importatore per Nazioni

import type { Payload } from 'payload'
import type { BackendNazione, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importNazioni(
  backendNazioni: BackendNazione[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Nazioni (${backendNazioni.length})...`)

  const stats: MigrationStats = {
    collection: 'nazioni',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const nazione of backendNazioni) {
    try {
      const created = await payload.create({
        collection: 'nazioni',
        data: {
          nome: nazione.nome,
          sigla: nazione.sigla.toUpperCase(),
          _status: 'published',
        },
      })

      idMap.set('nazioni', nazione.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando nazione ${nazione.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Nazioni: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
