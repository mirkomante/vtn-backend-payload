// Importatore per Bevande

import type { Payload } from 'payload'
import type { BackendBevanda, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importBevande(
  backendBevande: BackendBevanda[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Bevande (${backendBevande.length})...`)

  const stats: MigrationStats = {
    collection: 'bevande',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const bevanda of backendBevande) {
    try {
      // Il backend restituisce nazione e tipologia come oggetti popolati
      const backendTipologiaId = bevanda.tipologia?.id || bevanda.tipologiaId
      const tipologiaId = backendTipologiaId ? idMap.get('tipologie-bevanda', backendTipologiaId) : undefined

      if (!tipologiaId) {
        console.error(
          `   ⚠️  Tipologia non trovata per bevanda ${bevanda.nome} (tipologiaId: ${backendTipologiaId})`,
        )
        stats.errors++
        continue
      }

      // Nazione è required, quindi skippiamo se non c'è
      const backendNazioneId = bevanda.nazione?.id || bevanda.nazioneId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined

      if (!nazioneId) {
        console.error(
          `   ⚠️  Nazione non trovata per bevanda ${bevanda.nome}, skipping (campo required)`,
        )
        stats.skipped++
        continue
      }

      const created = await payload.create({
        collection: 'bevande',
        data: {
          nome: bevanda.nome,
          descrizione: bevanda.descrizione || '',
          prezzo: Number(bevanda.prezzo),
          inLista: bevanda.inLista !== undefined ? bevanda.inLista : true,
          nazione: nazioneId as number,
          tipologia: tipologiaId as number,
          _status: 'published',
        },
      })

      idMap.set('bevande', bevanda.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando bevanda ${bevanda.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Bevande: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
