// Client HTTP per recuperare dati dal backend attuale
// Aggiornato per API v1.2.0 con endpoint dedicati e supporto ?all=true

import type {
  BackendData,
  BackendResponse,
  BackendNazione,
  BackendRegione,
  BackendZona,
  BackendTipologia,
  BackendAllergene,
  BackendCategoriaPiatti,
  BackendCategoriaMenuFisso,
  BackendPiatto,
  BackendServizioAccessorio,
  BackendMenuFisso,
  BackendVino,
  BackendBirra,
  BackendLiquore,
  BackendCocktail,
  BackendBevanda,
} from './types'

const BACKEND_URL = 'https://vtn-backend-203473363873.europe-west1.run.app/api/v1'

/**
 * Effettua una richiesta HTTP al backend
 */
async function fetchFromBackend<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = (await response.json()) as BackendResponse<T[]>

    // Il backend restituisce { success, data, meta }
    if (json.success && json.data) {
      return json.data
    }

    return []
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}

/**
 * Recupera tutti i dati dal backend attuale
 * Utilizza i nuovi endpoint dedicati (API v1.2.0) e il parametro ?all=true
 * per recuperare tutti i record inclusi quelli con inLista=false
 */
export async function fetchAllData(): Promise<BackendData> {
  console.log('🔄 Recupero dati dal backend attuale (API v1.2.0)...')

  // Fetch di tutte le entità in parallelo usando gli endpoint dedicati
  // Gli endpoint con ?all=true restituiscono anche i record con inLista=false
  const [
    // Entità principali (con ?all=true per includere inLista=false)
    piatti,
    vini,
    birre,
    liquori,
    cocktail,
    bevande,
    menuFissi,
    serviziAccessori,
    // Entità lookup (endpoint dedicati - non hanno inLista)
    allergeni,
    nazioni,
    regioni,
    zone,
    tipologieVino,
    tipologieBirra,
    tipologieLiquore,
    tipologieCocktail,
    tipologieBevanda,
    categoriePiatti,
    categorieMenuFisso,
  ] = await Promise.all([
    // Entità principali con ?all=true
    fetchFromBackend<BackendPiatto>('/piatti?all=true'),
    fetchFromBackend<BackendVino>('/vini?all=true'),
    fetchFromBackend<BackendBirra>('/birre?all=true'),
    fetchFromBackend<BackendLiquore>('/liquori?all=true'),
    fetchFromBackend<BackendCocktail>('/cocktails?all=true'),
    fetchFromBackend<BackendBevanda>('/bevande?all=true'),
    fetchFromBackend<BackendMenuFisso>('/menu-fisso?all=true'),
    fetchFromBackend<BackendServizioAccessorio>('/servizi?all=true'),
    // Entità lookup (endpoint dedicati)
    fetchFromBackend<BackendAllergene>('/allergeni'),
    fetchFromBackend<BackendNazione>('/nazioni'),
    fetchFromBackend<BackendRegione>('/regioni'),
    fetchFromBackend<BackendZona>('/zone'),
    fetchFromBackend<BackendTipologia>('/tipologie-vino'),
    fetchFromBackend<BackendTipologia>('/tipologie-birra'),
    fetchFromBackend<BackendTipologia>('/tipologie-liquore'),
    fetchFromBackend<BackendTipologia>('/tipologie-cocktail'),
    fetchFromBackend<BackendTipologia>('/tipologie-bevanda'),
    fetchFromBackend<BackendCategoriaPiatti>('/categorie-piatti?all=true'),
    fetchFromBackend<BackendCategoriaMenuFisso>('/categoria-menu-fisso?all=true'),
  ])

  console.log('✅ Dati recuperati dal backend')
  console.log('   📦 Entità principali:')
  console.log(`      - Piatti: ${piatti.length}`)
  console.log(`      - Vini: ${vini.length}`)
  console.log(`      - Birre: ${birre.length}`)
  console.log(`      - Liquori: ${liquori.length}`)
  console.log(`      - Cocktail: ${cocktail.length}`)
  console.log(`      - Bevande: ${bevande.length}`)
  console.log(`      - Menu Fissi: ${menuFissi.length}`)
  console.log(`      - Servizi Accessori: ${serviziAccessori.length}`)
  console.log('   🏷️ Entità lookup:')
  console.log(`      - Allergeni: ${allergeni.length}`)
  console.log(`      - Nazioni: ${nazioni.length}`)
  console.log(`      - Regioni: ${regioni.length}`)
  console.log(`      - Zone: ${zone.length}`)
  console.log(`      - Tipologie Vino: ${tipologieVino.length}`)
  console.log(`      - Tipologie Birra: ${tipologieBirra.length}`)
  console.log(`      - Tipologie Liquore: ${tipologieLiquore.length}`)
  console.log(`      - Tipologie Cocktail: ${tipologieCocktail.length}`)
  console.log(`      - Tipologie Bevanda: ${tipologieBevanda.length}`)
  console.log(`      - Categorie Piatti: ${categoriePiatti.length}`)
  console.log(`      - Categorie Menu Fisso: ${categorieMenuFisso.length}`)

  return {
    // Entità lookup
    nazioni,
    regioni,
    zone,
    tipologieVino,
    tipologieBirra,
    tipologieLiquore,
    tipologieCocktail,
    tipologieBevanda,
    allergeni,
    categoriePiatti,
    categorieMenuFisso,
    // Entità principali
    piatti,
    serviziAccessori,
    menuFissi,
    vini,
    birre,
    liquori,
    cocktail,
    bevande,
  }
}
