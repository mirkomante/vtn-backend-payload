// Importatore per Allergeni

import type { Payload } from 'payload'
import type { BackendAllergene, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importAllergeni(
  backendAllergeni: BackendAllergene[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Allergeni (${backendAllergeni.length})...`)

  const stats: MigrationStats = {
    collection: 'allergeni',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const allergene of backendAllergeni) {
    try {
      const created = await payload.create({
        collection: 'allergeni',
        data: {
          nome: allergene.nome,
          descrizione: allergene.descrizione || '',
          _status: 'published',
        },
      })

      idMap.set('allergeni', allergene.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando allergene ${allergene.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Allergeni: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
