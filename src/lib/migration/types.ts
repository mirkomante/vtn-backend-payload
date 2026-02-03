// Tipi per i dati del backend attuale

export interface BackendResponse<T> {
  success: boolean
  data: T
  meta?: {
    timestamp: string
    version: string
  }
}

// Entità geografiche
export interface BackendNazione {
  id: number | string
  nome: string
  sigla: string
  createdAt?: string
  updatedAt?: string
}

export interface BackendRegione {
  id: number | string
  nome: string
  nazioneId?: number | string
  nazione?: BackendNazione
  createdAt?: string
  updatedAt?: string
}

export interface BackendZona {
  id: number | string
  nome: string
  regioneId?: number | string
  nazioneId?: number | string
  regione?: BackendRegione
  nazione?: BackendNazione
  createdAt?: string
  updatedAt?: string
}

// Tipologie
export interface BackendTipologia {
  id: number | string
  nome: string
  descrizione?: string | null
  createdAt?: string
  updatedAt?: string
}

// Allergeni
export interface BackendAllergene {
  id: number | string
  nome: string
  descrizione?: string | null
  createdAt?: string
  updatedAt?: string
}

// Categorie
export interface BackendCategoriaPiatti {
  id: number | string
  nome: string
  descrizione?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface BackendCategoriaMenuFisso {
  id: number | string
  nome: string
  descrizione?: string | null
  createdAt?: string
  updatedAt?: string
}

// Piatti
export interface BackendPiatto {
  id: number | string
  nome: string
  descrizione?: string | null
  prezzo: number | string
  inLista?: boolean
  glutenFree: boolean
  vegan: boolean
  noUovo: boolean
  noLatticini?: boolean
  soloMenuFissi: boolean
  categoriaId?: number | string
  categoria?: BackendCategoriaPiatti
  allergeni?: BackendAllergene[]
  createdAt?: string
  updatedAt?: string
}

// Servizi accessori
export interface BackendServizioAccessorio {
  id: number | string
  nome: string
  descrizione?: string | null
  prezzo: number | string
  inLista?: boolean
  createdAt?: string
  updatedAt?: string
}

// Menu fisso
export interface BackendMenuFisso {
  id: number | string
  nome: string
  descrizione?: string | null
  prezzo: number | string
  inLista?: boolean
  categoriaId?: number | string
  categoria?: BackendCategoriaMenuFisso
  piatti?: BackendPiatto[]
  servizi?: BackendServizioAccessorio[]
  createdAt?: string
  updatedAt?: string
}

// Bevande - Vino
export interface BackendVino {
  id: number | string
  nome: string
  descrizione?: string | null
  cantina?: string | null
  grado?: string | null
  certificazione?: string | null
  capacita?: string | null
  anno?: string | null
  prezzo: number | string
  prezzoCalice?: number | string | null
  inLista?: boolean
  nazioneId?: number | string
  regioneId?: number | string
  zonaId?: number | string
  tipologiaId?: number | string
  nazione?: BackendNazione
  regione?: BackendRegione
  zona?: BackendZona
  tipologia?: BackendTipologia
  createdAt?: string
  updatedAt?: string
}

// Bevande - Birra
export interface BackendBirra {
  id: number | string
  nome: string
  descrizione?: string | null
  grado?: string | null
  capacita?: string | null
  prezzo: number | string
  inLista?: boolean
  nazioneId?: number | string
  tipologiaId?: number | string
  nazione?: BackendNazione
  tipologia?: BackendTipologia
  createdAt?: string
  updatedAt?: string
}

// Bevande - Liquore
export interface BackendLiquore {
  id: number | string
  nome: string
  descrizione?: string | null
  grado?: string | null
  invecchiamento?: string | null
  capacita?: string | null
  prezzo: number | string
  inLista?: boolean
  nazioneId?: number | string
  tipologiaId?: number | string
  nazione?: BackendNazione
  tipologia?: BackendTipologia
  createdAt?: string
  updatedAt?: string
}

// Bevande - Cocktail
export interface BackendCocktail {
  id: number | string
  nome: string
  descrizione?: string | null
  prezzo: number | string
  inLista?: boolean
  nazioneId?: number | string
  tipologiaId?: number | string
  nazione?: BackendNazione
  tipologia?: BackendTipologia
  createdAt?: string
  updatedAt?: string
}

// Bevande - Bevanda
export interface BackendBevanda {
  id: number | string
  nome: string
  descrizione?: string | null
  prezzo: number | string
  inLista?: boolean
  nazioneId?: number | string
  tipologiaId?: number | string
  nazione?: BackendNazione
  tipologia?: BackendTipologia
  createdAt?: string
  updatedAt?: string
}

// Dati aggregati per la migrazione
export interface BackendData {
  nazioni: BackendNazione[]
  regioni: BackendRegione[]
  zone: BackendZona[]
  tipologieVino: BackendTipologia[]
  tipologieBirra: BackendTipologia[]
  tipologieLiquore: BackendTipologia[]
  tipologieCocktail: BackendTipologia[]
  tipologieBevanda: BackendTipologia[]
  allergeni: BackendAllergene[]
  categoriePiatti: BackendCategoriaPiatti[]
  categorieMenuFisso: BackendCategoriaMenuFisso[]
  piatti: BackendPiatto[]
  serviziAccessori: BackendServizioAccessorio[]
  menuFissi: BackendMenuFisso[]
  vini: BackendVino[]
  birre: BackendBirra[]
  liquori: BackendLiquore[]
  cocktail: BackendCocktail[]
  bevande: BackendBevanda[]
}

// Statistiche di migrazione
export interface MigrationStats {
  collection: string
  imported: number
  skipped: number
  errors: number
}

export interface MigrationResult {
  success: boolean
  stats: MigrationStats[]
  totalImported: number
  totalSkipped: number
  totalErrors: number
  duration: number
  errors?: Array<{ collection: string; error: string; item?: any }>
}
