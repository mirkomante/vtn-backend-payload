import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const Bevanda: CollectionConfig = {
  slug: 'bevande',
  labels: {
    singular: 'Bevanda',
    plural: 'Bevande',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'nazione', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome della bevanda' }),
    descrizioneField({ description: 'Descrizione opzionale della bevanda' }),
    prezzoField({ description: 'Prezzo (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se la bevanda è visibile nel menu pubblico',
      defaultValue: true,
    }),
    {
      name: 'nazione',
      type: 'relationship',
      relationTo: 'nazioni',
      required: true,
      label: 'Nazione',
      admin: {
        description: 'Nazione di produzione',
      },
    },
    {
      name: 'tipologia',
      type: 'relationship',
      relationTo: 'tipologie-bevanda',
      required: true,
      label: 'Tipologia',
      admin: {
        description: 'Tipologia della bevanda',
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
