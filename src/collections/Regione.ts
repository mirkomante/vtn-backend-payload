import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { menuImpostazioniReadAccess } from '../access/menuImpostazioniAccess'

export const Regione: CollectionConfig = {
  slug: 'regioni',
  labels: {
    singular: 'Regione',
    plural: 'Regioni',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Menu impostazioni',
    defaultColumns: ['nome', 'nazione', '_status', 'createdAt'],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      index: true,
      label: 'Nome',
      admin: {
        description: "Nome della regione (es. 'Toscana', 'Piemonte')",
      },
    },
    {
      name: 'nazione',
      type: 'relationship',
      relationTo: 'nazioni',
      required: true,
      label: 'Nazione',
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        if (data?.nome && data?.nazione) {
          const nazioneId =
            typeof data.nazione === 'object' ? data.nazione.id : data.nazione

          const existing = await req.payload.find({
            collection: 'regioni',
            where: {
              and: [
                { nome: { equals: data.nome } },
                { nazione: { equals: nazioneId } },
              ],
            },
            limit: 1,
            depth: 0,
            overrideAccess: false,
            req,
          })

          // Se è un update, escludi il documento corrente
          if (operation === 'update' && originalDoc?.id) {
            const filtered = existing.docs.filter(
              (doc) => doc.id !== originalDoc.id,
            )
            if (filtered.length > 0) {
              throw new APIError(
                'Una regione con questo nome esiste già in questa nazione',
                400,
              )
            }
          } else if (operation === 'create' && existing.docs.length > 0) {
            throw new APIError(
              'Una regione con questo nome esiste già in questa nazione',
              400,
            )
          }
        }
        return data
      },
    ],
  },
  access: {
    read: menuImpostazioniReadAccess,
  },
}
