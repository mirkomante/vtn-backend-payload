import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const Birra: CollectionConfig = {
  slug: 'birre',
  labels: {
    singular: 'Birra',
    plural: 'Birre',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'nazione', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome della birra' }),
    descrizioneField({ description: 'Descrizione opzionale della birra' }),
    {
      name: 'grado',
      type: 'text',
      label: 'Grado Alcolico',
      admin: {
        description: 'Grado alcolico (es. "5.2%", "4.5%")',
      },
    },
    {
      name: 'capacita',
      type: 'text',
      label: 'Capacità',
      admin: {
        description: 'Capacità (es. "33cl", "50cl", "1L")',
      },
    },
    prezzoField({ description: 'Prezzo (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se la birra è visibile nel menu pubblico',
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
      relationTo: 'tipologie-birra',
      required: true,
      label: 'Tipologia',
      admin: {
        description: 'Tipologia della birra',
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
