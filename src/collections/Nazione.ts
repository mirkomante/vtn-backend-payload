import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../access/menuImpostazioniAccess'

export const Nazione: CollectionConfig = {
  slug: 'nazioni',
  labels: {
    singular: 'Nazione',
    plural: 'Nazioni',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante impostazioni',
    defaultColumns: ['nome', 'sigla', '_status', 'createdAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dettagli',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'nome',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  label: 'Nome',
                  admin: {
                    width: '70%',
                    description: "Nome della nazione (es. 'Italia', 'Francia')",
                  },
                },
                {
                  name: 'sigla',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  maxLength: 3,
                  label: 'Sigla',
                  admin: {
                    width: '30%',
                    description: 'Sigla ISO alpha-3 (es. ITA, FRA)',
                  },
                  hooks: {
                    beforeChange: [
                      ({ value }) => {
                        // Converti in maiuscolo
                        return typeof value === 'string' ? value.toUpperCase() : value
                      },
                    ],
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
  access: {
    read: menuImpostazioniReadAccess,
    update: menuImpostazioniUpdateAccess,
    delete: menuImpostazioniDeleteAccess,
  },
}
