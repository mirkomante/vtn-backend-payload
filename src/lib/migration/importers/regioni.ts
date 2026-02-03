// Importatore per Regioni

import type { Payload } from 'payload'
import type { BackendRegione, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importRegioni(
  backendRegioni: BackendRegione[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Regioni (${backendRegioni.length})...`)

  const stats: MigrationStats = {
    collection: 'regioni',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const regione of backendRegioni) {
    try {
      // Il backend restituisce nazione come oggetto popolato, non nazioneId
      const backendNazioneId = regione.nazione?.id || regione.nazioneId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined

      if (!nazioneId) {
        console.error(`   ⚠️  Nazione non trovata per regione ${regione.nome} (nazioneId: ${backendNazioneId})`)
        stats.errors++
        continue
      }

      const created = await payload.create({
        collection: 'regioni',
        data: {
          nome: regione.nome,
          nazione: nazioneId as number,
        },
      })

      idMap.set('regioni', regione.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando regione ${regione.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Regioni: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
