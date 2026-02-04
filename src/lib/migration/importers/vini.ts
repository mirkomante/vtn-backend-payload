// Importatore per Vini

import type { Payload } from 'payload'
import type { BackendVino, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importVini(
  backendVini: BackendVino[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Vini (${backendVini.length})...`)

  const stats: MigrationStats = {
    collection: 'vini',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const vino of backendVini) {
    try {
      // Il backend restituisce nazione, regione, zona, tipologia come oggetti popolati
      const backendNazioneId = vino.nazione?.id || vino.nazioneId
      const backendTipologiaId = vino.tipologia?.id || vino.tipologiaId
      const nazioneId = backendNazioneId ? idMap.get('nazioni', backendNazioneId) : undefined
      const tipologiaId = backendTipologiaId ? idMap.get('tipologie-vino', backendTipologiaId) : undefined

      if (!nazioneId) {
        console.error(`   ⚠️  Nazione non trovata per vino ${vino.nome} (nazioneId: ${backendNazioneId})`)
        stats.errors++
        continue
      }

      if (!tipologiaId) {
        console.error(
          `   ⚠️  Tipologia non trovata per vino ${vino.nome} (tipologiaId: ${backendTipologiaId})`,
        )
        stats.errors++
        continue
      }

      const backendRegioneId = vino.regione?.id || vino.regioneId
      const backendZonaId = vino.zona?.id || vino.zonaId
      const regioneId = backendRegioneId ? idMap.get('regioni', backendRegioneId) : undefined
      const zonaId = backendZonaId ? idMap.get('zone', backendZonaId) : undefined

      const created = await payload.create({
        collection: 'vini',
        data: {
          nome: vino.nome,
          descrizione: vino.descrizione || '',
          cantina: vino.cantina || '',
          grado: vino.grado || '',
          certificazione: vino.certificazione || '',
          capacita: vino.capacita || '',
          anno: vino.anno || '',
          prezzo: Number(vino.prezzo),
          prezzoCalice: vino.prezzoCalice ? Number(vino.prezzoCalice) : undefined,
          inLista: vino.inLista !== undefined ? vino.inLista : true,
          nazione: nazioneId as number,
          regione: regioneId,
          zona: zonaId,
          tipologia: tipologiaId as number,
          _status: 'published',
        },
      })

      idMap.set('vini', vino.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando vino ${vino.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Vini: ${stats.imported} importati, ${stats.errors} errori`)
  return stats
}
