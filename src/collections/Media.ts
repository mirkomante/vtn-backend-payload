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
    // Deve essere true fisso, NON Boolean(process.env.GCS_BUCKET).
    // Motivo: payload.config.ts viene eseguito durante `next build` nel Dockerfile,
    // dove GCS_BUCKET non è disponibile. Se si usa Boolean(process.env.GCS_BUCKET),
    // il valore viene compilato come `false` nel bundle e rimane tale a runtime.
    // Con true fisso: in locale il plugin GCS è disabled (enabled: false), quindi
    // Payload ignora disableLocalStorage e usa lo storage locale normalmente.
    // In produzione il plugin è enabled e disableLocalStorage:true forza l'URL GCS.
    disableLocalStorage: true,
  },
}
