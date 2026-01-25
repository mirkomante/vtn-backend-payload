import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const Liquore: CollectionConfig = {
  slug: 'liquori',
  labels: {
    singular: 'Liquore',
    plural: 'Liquori',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'nazione', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome del liquore' }),
    descrizioneField({ description: 'Descrizione opzionale del liquore' }),
    {
      name: 'grado',
      type: 'text',
      label: 'Grado Alcolico',
      admin: {
        description: 'Grado alcolico (es. "40%", "35%")',
      },
    },
    {
      name: 'invecchiamento',
      type: 'text',
      label: 'Invecchiamento',
      admin: {
        description: 'Invecchiamento (es. "12 anni", "8 mesi", "Non invecchiato")',
      },
    },
    {
      name: 'capacita',
      type: 'text',
      label: 'Capacità',
      admin: {
        description: 'Capacità (es. "50ml", "70cl", "1L")',
      },
    },
    prezzoField({ description: 'Prezzo (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il liquore è visibile nel menu pubblico',
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
      relationTo: 'tipologie-liquore',
      required: true,
      label: 'Tipologia',
      admin: {
        description: 'Tipologia del liquore',
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
