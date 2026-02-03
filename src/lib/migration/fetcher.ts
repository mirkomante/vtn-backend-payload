// Client HTTP per recuperare dati dal backend attuale

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
 * Estrae entità uniche da array di oggetti
 */
function extractUnique<T extends { id: number | string }>(items: T[]): T[] {
  const seen = new Set<number | string>()
  const unique: T[] = []

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      unique.push(item)
    }
  }

  return unique
}

/**
 * Estrae nazioni dai dati delle bevande e piatti
 */
function extractNazioni(data: {
  vini: BackendVino[]
  birre: BackendBirra[]
  liquori: BackendLiquore[]
  cocktail: BackendCocktail[]
  bevande: BackendBevanda[]
}): BackendNazione[] {
  const nazioni: BackendNazione[] = []

  // Estrai da vini
  for (const vino of data.vini) {
    if (vino.nazione && vino.nazione.id && vino.nazione.nome) {
      nazioni.push(vino.nazione)
    }
  }

  // Estrai da birre
  for (const birra of data.birre) {
    if (birra.nazione && birra.nazione.id && birra.nazione.nome) {
      nazioni.push(birra.nazione)
    }
  }

  // Estrai da liquori
  for (const liquore of data.liquori) {
    if (liquore.nazione && liquore.nazione.id && liquore.nazione.nome) {
      nazioni.push(liquore.nazione)
    }
  }

  // Estrai da cocktail
  for (const cocktail of data.cocktail) {
    if (cocktail.nazione && cocktail.nazione.id && cocktail.nazione.nome) {
      nazioni.push(cocktail.nazione)
    }
  }

  // Estrai da bevande
  for (const bevanda of data.bevande) {
    if (bevanda.nazione && bevanda.nazione.id && bevanda.nazione.nome) {
      nazioni.push(bevanda.nazione)
    }
  }

  return extractUnique(nazioni)
}

/**
 * Estrae regioni dai vini
 * Nota: le regioni nel backend non hanno nazioneId separato,
 * quindi lo prendiamo dalla nazione del vino
 */
function extractRegioni(vini: BackendVino[]): BackendRegione[] {
  const regioni: BackendRegione[] = []

  for (const vino of vini) {
    if (vino.regione && vino.regione.id && vino.regione.nome && vino.nazione) {
      // Aggiungi la nazione alla regione se non è già presente
      const regioneConNazione: BackendRegione = {
        ...vino.regione,
        nazioneId: vino.nazione.id,
        nazione: vino.nazione,
      }
      regioni.push(regioneConNazione)
    }
  }

  return extractUnique(regioni)
}

/**
 * Estrae zone dai vini
 * Nota: le zone nel backend non hanno nazioneId/regioneId separati,
 * quindi li prendiamo dalla nazione e regione del vino
 */
function extractZone(vini: BackendVino[]): BackendZona[] {
  const zone: BackendZona[] = []

  for (const vino of vini) {
    if (vino.zona && vino.zona.id && vino.zona.nome && vino.nazione && vino.regione) {
      // Aggiungi la nazione e regione alla zona se non sono già presenti
      const zonaConRelazioni: BackendZona = {
        ...vino.zona,
        nazioneId: vino.nazione.id,
        nazione: vino.nazione,
        regioneId: vino.regione.id,
        regione: vino.regione,
      }
      zone.push(zonaConRelazioni)
    }
  }

  return extractUnique(zone)
}

/**
 * Estrae tipologie da bevande
 */
function extractTipologie<T extends { tipologia?: BackendTipologia }>(items: T[]): BackendTipologia[] {
  const tipologie: BackendTipologia[] = []

  for (const item of items) {
    if (item.tipologia && item.tipologia.id && item.tipologia.nome) {
      tipologie.push(item.tipologia)
    }
  }

  return extractUnique(tipologie)
}

/**
 * Estrae allergeni dai piatti
 */
function extractAllergeni(piatti: BackendPiatto[]): BackendAllergene[] {
  const allergeni: BackendAllergene[] = []

  for (const piatto of piatti) {
    if (piatto.allergeni && Array.isArray(piatto.allergeni)) {
      for (const allergene of piatto.allergeni) {
        // Filtra solo allergeni validi con nome definito
        if (allergene && allergene.id && allergene.nome) {
          allergeni.push(allergene)
        }
      }
    }
  }

  return extractUnique(allergeni)
}

/**
 * Estrae categorie piatti
 */
function extractCategoriePiatti(piatti: BackendPiatto[]): BackendCategoriaPiatti[] {
  const categorie: BackendCategoriaPiatti[] = []

  for (const piatto of piatti) {
    if (piatto.categoria && piatto.categoria.id && piatto.categoria.nome) {
      categorie.push(piatto.categoria)
    }
  }

  return extractUnique(categorie)
}

/**
 * Estrae categorie menu fisso
 */
function extractCategorieMenuFisso(menuFissi: BackendMenuFisso[]): BackendCategoriaMenuFisso[] {
  const categorie: BackendCategoriaMenuFisso[] = []

  for (const menu of menuFissi) {
    if (menu.categoria && menu.categoria.id && menu.categoria.nome) {
      categorie.push(menu.categoria)
    }
  }

  return extractUnique(categorie)
}

/**
 * Recupera tutti i dati dal backend attuale
 */
export async function fetchAllData(): Promise<BackendData> {
  console.log('🔄 Recupero dati dal backend attuale...')

  // Fetch delle entità principali in parallelo
  const [piatti, vini, birre, liquori, cocktail, bevande, menuFissi, serviziAccessori] = await Promise.all([
    fetchFromBackend<BackendPiatto>('/piatti'),
    fetchFromBackend<BackendVino>('/vini'),
    fetchFromBackend<BackendBirra>('/birre'),
    fetchFromBackend<BackendLiquore>('/liquori'),
    fetchFromBackend<BackendCocktail>('/cocktails'),
    fetchFromBackend<BackendBevanda>('/bevande'),
    fetchFromBackend<BackendMenuFisso>('/menu-fisso'),
    fetchFromBackend<BackendServizioAccessorio>('/servizi'),
  ])

  console.log('✅ Dati recuperati dal backend')
  console.log(`   - Piatti: ${piatti.length}`)
  console.log(`   - Vini: ${vini.length}`)
  console.log(`   - Birre: ${birre.length}`)
  console.log(`   - Liquori: ${liquori.length}`)
  console.log(`   - Cocktail: ${cocktail.length}`)
  console.log(`   - Bevande: ${bevande.length}`)
  console.log(`   - Menu Fissi: ${menuFissi.length}`)
  console.log(`   - Servizi Accessori: ${serviziAccessori.length}`)

  // Estrai entità secondarie dai dati recuperati
  const nazioni = extractNazioni({ vini, birre, liquori, cocktail, bevande })
  const regioni = extractRegioni(vini)
  const zone = extractZone(vini)
  const tipologieVino = extractTipologie(vini)
  const tipologieBirra = extractTipologie(birre)
  const tipologieLiquore = extractTipologie(liquori)
  const tipologieCocktail = extractTipologie(cocktail)
  const tipologieBevanda = extractTipologie(bevande)
  const allergeni = extractAllergeni(piatti)
  const categoriePiatti = extractCategoriePiatti(piatti)
  const categorieMenuFisso = extractCategorieMenuFisso(menuFissi)

  console.log('✅ Entità estratte dai dati')
  console.log(`   - Nazioni: ${nazioni.length}`)
  console.log(`   - Regioni: ${regioni.length}`)
  console.log(`   - Zone: ${zone.length}`)
  console.log(`   - Tipologie Vino: ${tipologieVino.length}`)
  console.log(`   - Tipologie Birra: ${tipologieBirra.length}`)
  console.log(`   - Tipologie Liquore: ${tipologieLiquore.length}`)
  console.log(`   - Tipologie Cocktail: ${tipologieCocktail.length}`)
  console.log(`   - Tipologie Bevanda: ${tipologieBevanda.length}`)
  console.log(`   - Allergeni: ${allergeni.length}`)
  console.log(`   - Categorie Piatti: ${categoriePiatti.length}`)
  console.log(`   - Categorie Menu Fisso: ${categorieMenuFisso.length}`)

  return {
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
