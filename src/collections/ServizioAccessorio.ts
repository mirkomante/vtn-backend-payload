import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const ServizioAccessorio: CollectionConfig = {
  slug: 'servizi-accessori',
  labels: {
    singular: 'Servizio accessorio',
    plural: 'Servizi',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'prezzo', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: 'Nome del servizio (es. "Coperto", "Pane e Grissini")' }),
    descrizioneField({ description: 'Descrizione opzionale del servizio' }),
    prezzoField({ description: 'Prezzo del servizio (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il servizio è visibile nel menu',
      defaultValue: true,
    }),
    {
      name: 'menuFissi',
      type: 'join',
      collection: 'menu-fisso',
      on: 'servizi',
      label: 'Menu Fissi',
      admin: {
        description: 'Menu fissi che includono questo servizio (sola lettura)',
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
