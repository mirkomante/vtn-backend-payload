// Importatore per Zone

import type { Payload } from 'payload'
import type { BackendZona, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importZone(
  backendZone: BackendZona[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Zone (${backendZone.length})...`)

  const stats: MigrationStats = {
    collection: 'zone',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const zona of backendZone) {
    try {
      // Il backend restituisce nazione e regione come oggetti popolati
      const backendNazioneId = zona.nazione?.id || zona.nazioneId
      const backendRegioneId = zona.regione?.id || zona.regioneId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined
      const regioneId = backendRegioneId ? idMap.get('regioni', backendRegioneId) : undefined

      if (!nazioneId) {
        console.error(`   ⚠️  Nazione non trovata per zona ${zona.nome} (nazioneId: ${backendNazioneId})`)
        stats.errors++
        continue
      }

      if (!regioneId) {
        console.error(`   ⚠️  Regione non trovata per zona ${zona.nome} (regioneId: ${backendRegioneId})`)
        stats.errors++
        continue
      }

      const created = await payload.create({
        collection: 'zone',
        data: {
          nome: zona.nome,
          nazione: nazioneId as number,
          regione: regioneId as number,
        },
      })

      idMap.set('zone', zona.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando zona ${zona.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Zone: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
