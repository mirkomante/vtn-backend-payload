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
    group: 'Menu impostazioni',
    defaultColumns: ['nome', 'sigla', '_status', 'createdAt'],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Nome',
      admin: {
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
