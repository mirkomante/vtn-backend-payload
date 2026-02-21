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
    // Genera l'URL pubblico GCS per le anteprime nell'Admin Panel.
    // Questo bypassa la logica del plugin che può fallire con Uniform Bucket Level Access.
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
        // Garantisce URL corretti anche se il plugin genera URL locali come fallback
        // (es. con Uniform Bucket Level Access attivo sul bucket).
        if (doc.filename && process.env.GCS_BUCKET) {
          doc.url = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.filename}`
        }
        return doc
      },
    ],
  },
}
