import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../access/menuImpostazioniAccess'

/**
 * Collection `MediaRistorante` — Upload dedicato alle immagini del menu ristorante.
 *
 * Separata dalla collection `Media` generica per:
 * - Isolamento dei permessi (solo admin ristorante può caricare/eliminare)
 * - Separazione semantica dai media del sito (che arriveranno in futuro)
 * - Visibilità pubblica in lettura (le immagini vengono servite al frontend)
 *
 * Usata da:
 * - `menu-config` → Tab "Identità" → campo `logo`
 * - `menu-config` → `standardItems[].icona` e `specialItems[].icona`
 *
 * Group: "Ristorante impostazioni"
 * Storage: GCS in produzione (via plugin gcsStorage in payload.config.ts),
 *          locale in sviluppo.
 */
export const MediaRistorante: CollectionConfig = {
  slug: 'media-ristorante',
  labels: {
    singular: 'Media Ristorante',
    plural: 'Media Ristorante',
  },
  admin: {
    group: 'Ristorante impostazioni',
    useAsTitle: 'alt',
    description: 'Immagini e media utilizzati nel menu del ristorante (logo, icone sezioni).',
  },
  access: {
    read: () => true,
    create: menuImpostazioniUpdateAccess,
    update: menuImpostazioniUpdateAccess,
    delete: menuImpostazioniDeleteAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Testo alternativo',
      required: true,
      admin: {
        description: 'Descrizione dell\'immagine per accessibilità e SEO (es. "Logo ristorante").',
      },
    },
  ],
  upload: {
    // Genera l'URL pubblico GCS per le anteprime nell'Admin Panel.
    adminThumbnail: ({ doc }) => {
      if (process.env.GCS_BUCKET && doc.filename) {
        return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.filename}`
      }
      return null
    },
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Sovrascrive doc.url con l'URL pubblico GCS ad ogni lettura.
        if (doc.filename && process.env.GCS_BUCKET) {
          doc.url = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.filename}`
        }
        return doc
      },
    ],
  },
}
