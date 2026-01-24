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
 * Campo inLista comune per le categorie
 */
export const inListaField = (options?: {
  description?: string
  defaultValue?: boolean
}): Field => ({
  name: 'inLista',
  type: 'checkbox',
  defaultValue: options?.defaultValue !== false, // default true
  label: 'In Lista',
  admin: {
    description: options?.description || 'Se la categoria è visibile nel menu',
    components: {
      Cell: '/components/InListaCell#InListaCell',
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
  label: 'Prezzo',
  min: 0,
  max: 99999999.99,
  admin: {
    description: options?.description || 'Prezzo del piatto (max 10 cifre, 2 decimali)',
    step: 0.01,
  },
  validate: (value) => {
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
