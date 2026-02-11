import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../access/menuImpostazioniAccess'

export const Zona: CollectionConfig = {
  slug: 'zone',
  labels: {
    singular: 'Zona',
    plural: 'Zone',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante impostazioni',
    defaultColumns: ['nome', 'regione', 'nazione', '_status', 'createdAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dettagli',
          fields: [
            {
              name: 'nome',
              type: 'text',
              required: true,
              index: true,
              label: 'Nome',
              admin: {
                description: "Nome della zona (es. 'Chianti', 'Barolo')",
              },
            },
          ],
        },
        {
          label: 'Gerarchia',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'nazione',
                  type: 'relationship',
                  relationTo: 'nazioni',
                  required: true,
                  label: 'Nazione',
                  admin: {
                    width: '50%',
                    description: 'Per facilitare le query',
                  },
                },
                {
                  name: 'regione',
                  type: 'relationship',
                  relationTo: 'regioni',
                  required: true,
                  label: 'Regione',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        if (data?.nome && data?.regione) {
          const regioneId =
            typeof data.regione === 'object' ? data.regione.id : data.regione

          const existing = await req.payload.find({
            collection: 'zone',
            where: {
              and: [
                { nome: { equals: data.nome } },
                { regione: { equals: regioneId } },
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
                'Una zona con questo nome esiste già in questa regione',
                400,
              )
            }
          } else if (operation === 'create' && existing.docs.length > 0) {
            throw new APIError(
              'Una zona con questo nome esiste già in questa regione',
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
    update: menuImpostazioniUpdateAccess,
    delete: menuImpostazioniDeleteAccess,
  },
}
