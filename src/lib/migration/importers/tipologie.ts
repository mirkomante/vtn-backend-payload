// Importatore per Tipologie (generico per tutti i tipi)

import type { Payload } from 'payload'
import type { BackendTipologia, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importTipologie(
  backendTipologie: BackendTipologia[],
  payload: Payload,
  idMap: IDMapper,
  collection: 'tipologie-vino' | 'tipologie-birra' | 'tipologie-liquore' | 'tipologie-cocktail' | 'tipologie-bevanda',
  mapKey: string,
): Promise<MigrationStats> {
  console.log(`📦 Importazione ${collection} (${backendTipologie.length})...`)

  const stats: MigrationStats = {
    collection,
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const tipologia of backendTipologie) {
    try {
      const created = await payload.create({
        collection,
        data: {
          nome: tipologia.nome,
          descrizione: tipologia.descrizione || '',
        },
      })

      idMap.set(mapKey, tipologia.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando tipologia ${tipologia.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ ${collection}: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
