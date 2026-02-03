// Endpoint custom per la migrazione dati dal backend attuale

import type { Endpoint } from 'payload'
import { APIError } from 'payload'
import { fetchAllData } from '../lib/migration/fetcher'
import { cleanExistingData } from '../lib/migration/cleaner'
import { IDMapper } from '../lib/migration/mapper'
import { importNazioni } from '../lib/migration/importers/nazioni'
import { importRegioni } from '../lib/migration/importers/regioni'
import { importZone } from '../lib/migration/importers/zone'
import { importTipologie } from '../lib/migration/importers/tipologie'
import { importAllergeni } from '../lib/migration/importers/allergeni'
import { importCategoriePiatti, importCategorieMenuFisso } from '../lib/migration/importers/categorie'
import { importPiatti } from '../lib/migration/importers/piatti'
import { importServiziAccessori } from '../lib/migration/importers/servizi'
import { importMenuFisso } from '../lib/migration/importers/menuFisso'
import { importVini } from '../lib/migration/importers/vini'
import { importBirre } from '../lib/migration/importers/birre'
import { importLiquori } from '../lib/migration/importers/liquori'
import { importCocktail } from '../lib/migration/importers/cocktail'
import { importBevande } from '../lib/migration/importers/bevande'
import type { MigrationResult, MigrationStats } from '../lib/migration/types'

export const migrateDataEndpoint: Endpoint = {
  path: '/migrate-data',
  method: 'post',
  handler: async (req) => {
    const startTime = Date.now()

    try {
      // 1. Verifica autenticazione admin
      if (!req.user) {
        throw new APIError('Non autenticato', 401)
      }

      if (!req.user.roles?.includes('admin')) {
        throw new APIError('Accesso negato. Solo gli admin possono eseguire la migrazione.', 403)
      }

      console.log('🚀 Inizio migrazione dati')
      console.log(`   Utente: ${req.user.id}`)

      const allStats: MigrationStats[] = []
      const errors: Array<{ collection: string; error: string; item?: any }> = []

      // 2. Elimina dati esistenti (eccetto users)
      console.log('\n📋 Step 1: Pulizia dati esistenti')
      const cleanResult = await cleanExistingData(req.payload)

      if (!cleanResult.success) {
        console.error('⚠️  Alcuni errori durante la pulizia, ma continuo...')
      }

      // 3. Recupera dati da backend attuale
      console.log('\n📋 Step 2: Recupero dati dal backend attuale')
      const backendData = await fetchAllData()

      // 4. Inizializza mapper per ID
      const idMap = new IDMapper()

      // 5. Importa nell'ordine corretto per rispettare le dipendenze
      console.log('\n📋 Step 3: Importazione dati in Payload')

      // 5.1 Nazioni (nessuna dipendenza)
      const nazioniStats = await importNazioni(backendData.nazioni, req.payload, idMap)
      allStats.push(nazioniStats)

      // 5.2 Regioni (dipende da Nazioni)
      const regioniStats = await importRegioni(backendData.regioni, req.payload, idMap)
      allStats.push(regioniStats)

      // 5.3 Zone (dipende da Regioni e Nazioni)
      const zoneStats = await importZone(backendData.zone, req.payload, idMap)
      allStats.push(zoneStats)

      // 5.4 Tipologie (5 collections)
      const tipologieVinoStats = await importTipologie(
        backendData.tipologieVino,
        req.payload,
        idMap,
        'tipologie-vino',
        'tipologie-vino',
      )
      allStats.push(tipologieVinoStats)

      const tipologieBirraStats = await importTipologie(
        backendData.tipologieBirra,
        req.payload,
        idMap,
        'tipologie-birra',
        'tipologie-birra',
      )
      allStats.push(tipologieBirraStats)

      const tipologieLiquoreStats = await importTipologie(
        backendData.tipologieLiquore,
        req.payload,
        idMap,
        'tipologie-liquore',
        'tipologie-liquore',
      )
      allStats.push(tipologieLiquoreStats)

      const tipologieCocktailStats = await importTipologie(
        backendData.tipologieCocktail,
        req.payload,
        idMap,
        'tipologie-cocktail',
        'tipologie-cocktail',
      )
      allStats.push(tipologieCocktailStats)

      const tipologieBevandaStats = await importTipologie(
        backendData.tipologieBevanda,
        req.payload,
        idMap,
        'tipologie-bevanda',
        'tipologie-bevanda',
      )
      allStats.push(tipologieBevandaStats)

      // 5.5 Allergeni (nessuna dipendenza)
      const allergeniStats = await importAllergeni(backendData.allergeni, req.payload, idMap)
      allStats.push(allergeniStats)

      // 5.6 Categorie (2 collections)
      const categoriePiattiStats = await importCategoriePiatti(
        backendData.categoriePiatti,
        req.payload,
        idMap,
      )
      allStats.push(categoriePiattiStats)

      const categorieMenuFissoStats = await importCategorieMenuFisso(
        backendData.categorieMenuFisso,
        req.payload,
        idMap,
      )
      allStats.push(categorieMenuFissoStats)

      // 5.7 Piatti (dipende da Categorie e Allergeni)
      const piattiStats = await importPiatti(backendData.piatti, req.payload, idMap)
      allStats.push(piattiStats)

      // 5.8 Servizi Accessori (nessuna dipendenza diretta)
      const serviziStats = await importServiziAccessori(
        backendData.serviziAccessori,
        req.payload,
        idMap,
      )
      allStats.push(serviziStats)

      // 5.9 Menu Fisso (dipende da Categorie, Piatti, Servizi)
      const menuFissoStats = await importMenuFisso(backendData.menuFissi, req.payload, idMap)
      allStats.push(menuFissoStats)

      // 5.10 Bevande (5 collections - dipendono da Nazioni, Regioni, Zone, Tipologie)
      const viniStats = await importVini(backendData.vini, req.payload, idMap)
      allStats.push(viniStats)

      const birreStats = await importBirre(backendData.birre, req.payload, idMap)
      allStats.push(birreStats)

      const liquoriStats = await importLiquori(backendData.liquori, req.payload, idMap)
      allStats.push(liquoriStats)

      const cocktailStats = await importCocktail(backendData.cocktail, req.payload, idMap)
      allStats.push(cocktailStats)

      const bevandeStats = await importBevande(backendData.bevande, req.payload, idMap)
      allStats.push(bevandeStats)

      // 6. Calcola statistiche finali
      const totalImported = allStats.reduce((sum, stat) => sum + stat.imported, 0)
      const totalSkipped = allStats.reduce((sum, stat) => sum + stat.skipped, 0)
      const totalErrors = allStats.reduce((sum, stat) => sum + stat.errors, 0)
      const duration = Date.now() - startTime

      console.log('\n✅ Migrazione completata!')
      console.log(`   Tempo totale: ${(duration / 1000).toFixed(2)}s`)
      console.log(`   Documenti importati: ${totalImported}`)
      console.log(`   Documenti saltati: ${totalSkipped}`)
      console.log(`   Errori: ${totalErrors}`)

      // 7. Restituisci risultato
      const result: MigrationResult = {
        success: totalErrors === 0,
        stats: allStats,
        totalImported,
        totalSkipped,
        totalErrors,
        duration,
        errors: errors.length > 0 ? errors : undefined,
      }

      return Response.json(result)
    } catch (error) {
      console.error('❌ Errore durante la migrazione:', error)

      const duration = Date.now() - startTime

      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          duration,
        },
        { status: 500 },
      )
    }
  },
}
