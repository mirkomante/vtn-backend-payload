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
  },
})
