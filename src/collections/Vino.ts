import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import {
  nomeField,
  descrizioneField,
  inListaField,
  prezzoField,
  prezzoCaliceField,
} from './fields/commonFields'

export const Vino: CollectionConfig = {
  slug: 'vini',
  labels: {
    singular: 'Vino',
    plural: 'Vini',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'cantina', 'nazione', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome del vino' }),
    descrizioneField({ description: 'Descrizione opzionale del vino' }),
    {
      name: 'cantina',
      type: 'text',
      label: 'Cantina',
      admin: {
        description: 'Nome della cantina produttrice',
      },
    },
    {
      name: 'grado',
      type: 'text',
      label: 'Grado Alcolico',
      admin: {
        description: 'Grado alcolico (es. "13.5%", "12%")',
      },
    },
    {
      name: 'certificazione',
      type: 'text',
      label: 'Certificazione',
      admin: {
        description: 'Certificazione (es. DOC, DOCG, IGT)',
      },
    },
    {
      name: 'capacita',
      type: 'text',
      label: 'Capacità',
      admin: {
        description: 'Capacità della bottiglia (es. "750ml", "1L")',
      },
    },
    prezzoCaliceField({ description: 'Prezzo per calice (max 10 cifre, 2 decimali)' }),
    prezzoField({ description: 'Prezzo della bottiglia (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il vino è visibile nel menu pubblico',
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
      name: 'regione',
      type: 'relationship',
      relationTo: 'regioni',
      label: 'Regione',
      admin: {
        description: 'Regione di produzione (opzionale)',
      },
    },
    {
      name: 'zona',
      type: 'relationship',
      relationTo: 'zone',
      label: 'Zona',
      admin: {
        description: 'Zona di produzione (opzionale)',
      },
    },
    {
      name: 'tipologia',
      type: 'relationship',
      relationTo: 'tipologie-vino',
      required: true,
      label: 'Tipologia',
      admin: {
        description: 'Tipologia del vino',
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
