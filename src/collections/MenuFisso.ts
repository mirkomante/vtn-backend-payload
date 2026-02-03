import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'

export const MenuFisso: CollectionConfig = {
  slug: 'menu-fisso',
  labels: {
    singular: 'Menù Fisso',
    plural: 'Menù Fissi',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'inLista', 'categoria', 'prezzo', '_status'],
  },
  fields: [
    nomeField({ description: 'Nome del menu fisso' }),
    descrizioneField({ description: 'Descrizione opzionale del menu' }),
    prezzoField({ description: 'Prezzo del menu fisso (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il menu è visibile nel menu pubblico',
      defaultValue: true,
      collectionSlug: 'menu-fisso',
    }),
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categoria-menu-fisso',
      required: true,
      label: 'Categoria',
      maxDepth: 1, // Carica dati categoria ma non relazioni annidate
      index: true, // Index per query veloci per categoria
      admin: {
        description: 'Categoria del menu fisso',
      },
    },
    {
      name: 'piatti',
      type: 'relationship',
      relationTo: 'piatti',
      hasMany: true,
      label: 'Piatti',
      maxDepth: 1, // Carica dati piatti ma non relazioni annidate
      admin: {
        description: 'Piatti inclusi nel menu',
      },
    },
    {
      name: 'servizi',
      type: 'relationship',
      relationTo: 'servizi-accessori',
      hasMany: true,
      label: 'Servizi',
      maxDepth: 1, // Carica dati servizi ma non relazioni annidate
      admin: {
        description: 'Servizi inclusi nel menu',
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
