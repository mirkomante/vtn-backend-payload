import type { Config, Plugin } from 'payload'

/**
 * Plugin che aggiunge automaticamente il bottone "Annulla" a tutte le collections e globals.
 * Il bottone permette di tornare alla lista (collections) o alla vista (globals) senza salvare.
 * 
 * Usa un wrapper per SaveDraftButton che aggiunge il bottone Annulla accanto nella barra degli strumenti.
 */
export const cancelButtonPlugin = (): Plugin => (config: Config): Config => {
  return {
    ...config,
    // Sostituisci SaveDraftButton con il wrapper che include il bottone Annulla
    collections: config.collections?.map((collection) => {
      // Ottieni i componenti esistenti
      const existingComponents = collection.admin?.components || {}
      const existingEditComponents = (existingComponents.edit || {}) as any

      // Se SaveDraftButton è già stato sostituito, non fare nulla
      if (existingEditComponents.SaveDraftButton === './components/SaveDraftButtonWithCancel') {
        return collection
      }

      return {
        ...collection,
        admin: {
          ...collection.admin,
          components: {
            ...existingComponents,
            edit: {
              ...existingEditComponents,
              // Sostituisci SaveDraftButton con il wrapper
              SaveDraftButton: './components/SaveDraftButtonWithCancel',
            } as any,
          },
        },
      }
    }),
    // Stessa cosa per i globals
    globals: config.globals?.map((global) => {
      // Ottieni i componenti esistenti
      const existingComponents = global.admin?.components || {}
      const existingEditComponents = (existingComponents.edit || {}) as any

      // Se SaveDraftButton è già stato sostituito, non fare nulla
      if (existingEditComponents.SaveDraftButton === './components/SaveDraftButtonWithCancel') {
        return global
      }

      return {
        ...global,
        admin: {
          ...global.admin,
          components: {
            ...existingComponents,
            edit: {
              ...existingEditComponents,
              // Sostituisci SaveDraftButton con il wrapper
              SaveDraftButton: './components/SaveDraftButtonWithCancel',
            } as any,
          },
        },
      }
    }),
  }
}
