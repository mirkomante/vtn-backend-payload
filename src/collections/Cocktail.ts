import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const Cocktail: CollectionConfig = {
  slug: 'cocktail',
  labels: {
    singular: 'Cocktail',
    plural: 'Cocktail',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'nazione', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome del cocktail' }),
    descrizioneField({ description: 'Descrizione opzionale del cocktail' }),
    prezzoField({ description: 'Prezzo (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il cocktail è visibile nel menu pubblico',
      defaultValue: true,
    }),
    {
      name: 'nazione',
      type: 'relationship',
      relationTo: 'nazioni',
      required: true,
      label: 'Nazione',
      admin: {
        description: 'Nazione di origine del cocktail',
      },
    },
    {
      name: 'tipologia',
      type: 'relationship',
      relationTo: 'tipologie-cocktail',
      required: true,
      label: 'Tipologia',
      admin: {
        description: 'Tipologia del cocktail',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
  access: {
    read: menuRistoranteReadAccess,
    update: menuRistoranteUpdateAccess,
    delete: menuRistoranteDeleteAccess,
  },
}
