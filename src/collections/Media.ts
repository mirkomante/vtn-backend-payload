import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Disabilita lo storage locale quando GCS è attivo.
    // Senza questo flag, Payload salva i file localmente anche quando il plugin GCS
    // è abilitato, e l'URL restituito è quello locale (/api/media/file/...) invece
    // dell'URL pubblico di GCS (https://storage.googleapis.com/...).
    disableLocalStorage: Boolean(process.env.GCS_BUCKET),
  },
}
