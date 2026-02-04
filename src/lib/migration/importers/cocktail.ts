// Importatore per Cocktail

import type { Payload } from 'payload'
import type { BackendCocktail, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importCocktail(
  backendCocktail: BackendCocktail[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Cocktail (${backendCocktail.length})...`)

  const stats: MigrationStats = {
    collection: 'cocktail',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const cocktail of backendCocktail) {
    try {
      // Il backend restituisce nazione e tipologia come oggetti popolati
      const backendTipologiaId = cocktail.tipologia?.id || cocktail.tipologiaId
      const tipologiaId = backendTipologiaId ? idMap.get('tipologie-cocktail', backendTipologiaId) : undefined

      if (!tipologiaId) {
        console.error(
          `   ⚠️  Tipologia non trovata per cocktail ${cocktail.nome} (tipologiaId: ${backendTipologiaId})`,
        )
        stats.errors++
        continue
      }

      // Nazione è required, quindi skippiamo se non c'è
      const backendNazioneId = cocktail.nazione?.id || cocktail.nazioneId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined

      if (!nazioneId) {
        console.error(
          `   ⚠️  Nazione non trovata per cocktail ${cocktail.nome}, skipping (campo required)`,
        )
        stats.skipped++
        continue
      }

      const created = await payload.create({
        collection: 'cocktail',
        data: {
          nome: cocktail.nome,
          descrizione: cocktail.descrizione || '',
          prezzo: Number(cocktail.prezzo),
          inLista: cocktail.inLista !== undefined ? cocktail.inLista : true,
          nazione: nazioneId as number,
          tipologia: tipologiaId as number,
          _status: 'published',
        },
      })

      idMap.set('cocktail', cocktail.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando cocktail ${cocktail.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Cocktail: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
