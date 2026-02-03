// Importatore per Liquori

import type { Payload } from 'payload'
import type { BackendLiquore, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importLiquori(
  backendLiquori: BackendLiquore[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Liquori (${backendLiquori.length})...`)

  const stats: MigrationStats = {
    collection: 'liquori',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const liquore of backendLiquori) {
    try {
      // Il backend restituisce nazione e tipologia come oggetti popolati
      const backendNazioneId = liquore.nazione?.id || liquore.nazioneId
      const backendTipologiaId = liquore.tipologia?.id || liquore.tipologiaId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined
      const tipologiaId = backendTipologiaId ? idMap.get('tipologie-liquore', backendTipologiaId) : undefined

      if (!nazioneId) {
        console.error(
          `   ⚠️  Nazione non trovata per liquore ${liquore.nome} (nazioneId: ${backendNazioneId})`,
        )
        stats.errors++
        continue
      }

      if (!tipologiaId) {
        console.error(
          `   ⚠️  Tipologia non trovata per liquore ${liquore.nome} (tipologiaId: ${backendTipologiaId})`,
        )
        stats.errors++
        continue
      }

      const created = await payload.create({
        collection: 'liquori',
        data: {
          nome: liquore.nome,
          descrizione: liquore.descrizione || '',
          grado: liquore.grado || '',
          invecchiamento: liquore.invecchiamento || '',
          capacita: liquore.capacita || '',
          prezzo: Number(liquore.prezzo),
          inLista: true,
          nazione: nazioneId as number,
          tipologia: tipologiaId as number,
        },
      })

      idMap.set('liquori', liquore.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando liquore ${liquore.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Liquori: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
