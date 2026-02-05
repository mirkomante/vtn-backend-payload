import type { Field } from 'payload'

/**
 * Campo nome comune per le collections
 */
export const nomeField = (options?: {
  description?: string
  unique?: boolean
}): Field => ({
  name: 'nome',
  type: 'text',
  required: true,
  unique: options?.unique !== false, // default true
  index: true,
  label: 'Nome',
  admin: {
    description: options?.description,
  },
})

/**
 * Campo descrizione comune per le collections
 */
export const descrizioneField = (options?: {
  description?: string
}): Field => ({
  name: 'descrizione',
  type: 'textarea',
  label: 'Descrizione',
  admin: {
    description: options?.description || 'Testo lungo per descrizione dettagliata',
  },
})

/**
 * Campo inLista comune per le categorie e i prodotti.
 * Usa un toggle interattivo nella lista per attivare/disattivare rapidamente.
 */
export const inListaField = (options: {
  description?: string
  defaultValue?: boolean
  collectionSlug: string // Necessario per l'API call del toggle
}): Field => ({
  name: 'inLista',
  type: 'checkbox',
  defaultValue: options?.defaultValue !== false, // default true
  label: 'In Lista',
  admin: {
    description: options?.description || 'Se visibile nel menu pubblico',
    components: {
      Cell: {
        path: '/components/InListaToggleCell#InListaToggleCell',
        clientProps: {
          collectionSlug: options.collectionSlug,
        },
      },
    },
  },
})

/**
 * Campo prezzo comune per i piatti
 * Max 10 cifre totali, 2 decimali (es. 99999999.99)
 */
export const prezzoField = (options?: {
  description?: string
}): Field => ({
  name: 'prezzo',
  type: 'number',
  required: true,
  label: 'Prezzo (€)',
  min: 0,
  max: 99999999.99,
  admin: {
    description: options?.description || 'Prezzo del piatto (max 10 cifre, 2 decimali)',
    step: 0.01,
    components: {
      Cell: '/components/PrezzoCell#PrezzoCell',
    },
  },
  validate: (value: any) => {
    if (value === undefined || value === null) {
      return 'Il prezzo è obbligatorio'
    }
    if (value < 0) {
      return 'Il prezzo non può essere negativo'
    }
    if (value > 99999999.99) {
      return 'Il prezzo non può superare 99999999.99'
    }
    // Verifica che non ci siano più di 2 decimali
    const decimalPart = value.toString().split('.')[1]
    if (decimalPart && decimalPart.length > 2) {
      return 'Il prezzo può avere massimo 2 decimali'
    }
    return true
  },
})

/**
 * Campo prezzo calice opzionale per i vini
 * Max 10 cifre totali, 2 decimali (es. 99999999.99)
 */
export const prezzoCaliceField = (options?: {
  description?: string
}): Field => ({
  name: 'prezzoCalice',
  type: 'number',
  required: false,
  label: 'Prezzo Calice (€)',
  min: 0,
  max: 99999999.99,
  admin: {
    description: options?.description || 'Prezzo per calice (max 10 cifre, 2 decimali)',
    step: 0.01,
    components: {
      Cell: '/components/PrezzoCell#PrezzoCell',
    },
  },
  validate: (value: any) => {
    if (value === undefined || value === null) {
      return true // Opzionale
    }
    if (value < 0) {
      return 'Il prezzo non può essere negativo'
    }
    if (value > 99999999.99) {
      return 'Il prezzo non può superare 99999999.99'
    }
    // Verifica che non ci siano più di 2 decimali
    const decimalPart = value.toString().split('.')[1]
    if (decimalPart && decimalPart.length > 2) {
      return 'Il prezzo può avere massimo 2 decimali'
    }
    return true
  },
})

/**
 * Campo grado alcolico comune per bevande alcoliche
 */
export const gradoField = (options?: {
  description?: string
}): Field => ({
  name: 'grado',
  type: 'text',
  label: 'Grado Alcolico',
  admin: {
    description: options?.description || 'Grado alcolico (es. "13.5%", "5.2%", "40%")',
  },
})

/**
 * Campo capacita comune per bevande
 */
export const capacitaField = (options?: {
  description?: string
}): Field => ({
  name: 'capacita',
  type: 'text',
  label: 'Capacità',
  admin: {
    description: options?.description || 'Capacità (es. "750ml", "33cl", "1L")',
  },
})
