// Importatore per Birre

import type { Payload } from 'payload'
import type { BackendBirra, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importBirre(
  backendBirre: BackendBirra[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Birre (${backendBirre.length})...`)

  const stats: MigrationStats = {
    collection: 'birre',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const birra of backendBirre) {
    try {
      // Il backend restituisce nazione e tipologia come oggetti popolati
      const backendNazioneId = birra.nazione?.id || birra.nazioneId
      const backendTipologiaId = birra.tipologia?.id || birra.tipologiaId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined
      const tipologiaId = backendTipologiaId ? idMap.get('tipologie-birra', backendTipologiaId) : undefined

      if (!nazioneId) {
        console.error(`   ⚠️  Nazione non trovata per birra ${birra.nome} (nazioneId: ${backendNazioneId})`)
        stats.errors++
        continue
      }

      if (!tipologiaId) {
        console.error(
          `   ⚠️  Tipologia non trovata per birra ${birra.nome} (tipologiaId: ${backendTipologiaId})`,
        )
        stats.errors++
        continue
      }

      const created = await payload.create({
        collection: 'birre',
        data: {
          nome: birra.nome,
          descrizione: birra.descrizione || '',
          grado: birra.grado || '',
          capacita: birra.capacita || '',
          prezzo: Number(birra.prezzo),
          inLista: birra.inLista !== undefined ? birra.inLista : true,
          nazione: nazioneId as number,
          tipologia: tipologiaId as number,
          _status: 'published',
        },
      })

      idMap.set('birre', birra.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando birra ${birra.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Birre: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
