import type { CollectionConfig } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'
import { createCleanupHook } from '../hooks/cleanupRelationships'

export const Piatti: CollectionConfig = {
  slug: 'piatti',
  labels: {
    singular: 'Piatto',
    plural: 'Piatti',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'inLista', 'categoria', 'prezzo', '_status'],
  },
  fields: [
    nomeField({ description: 'Nome del piatto' }),
    descrizioneField({ description: 'Descrizione opzionale del piatto' }),
    prezzoField({ description: 'Prezzo del piatto (max 10 cifre, 2 decimali)' }),
    inListaField({
      description: 'Se il piatto è visibile nel menu pubblico',
      defaultValue: true,
      collectionSlug: 'piatti',
    }),
    {
      name: 'glutenFree',
      type: 'checkbox',
      defaultValue: false,
      label: 'Senza Glutine',
      admin: {
        description: 'Se il piatto è senza glutine',
      },
    },
    {
      name: 'noUovo',
      type: 'checkbox',
      defaultValue: false,
      label: 'No Uovo',
      admin: {
        description: 'Se il piatto non contiene uova',
      },
    },
    {
      name: 'noLatticini',
      type: 'checkbox',
      defaultValue: false,
      label: 'No Latticini',
      admin: {
        description: 'Se il piatto non contiene latticini',
      },
    },
    {
      name: 'vegan',
      type: 'checkbox',
      defaultValue: false,
      label: 'Vegano',
      admin: {
        description: 'Se il piatto è vegano',
      },
    },
    {
      name: 'soloMenuFissi',
      type: 'checkbox',
      defaultValue: false,
      label: 'Solo Menu Fissi',
      admin: {
        description: 'Se il piatto è disponibile solo nei menu fissi (non nel menu pubblico)',
      },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categoria-piatti',
      required: true,
      label: 'Categoria',
      maxDepth: 1, // Carica dati categoria ma non relazioni annidate
      index: true, // Index per query veloci per categoria
      admin: {
        description: 'Categoria del piatto',
      },
    },
    {
      name: 'allergeni',
      type: 'relationship',
      relationTo: 'allergeni',
      hasMany: true,
      label: 'Allergeni',
      maxDepth: 1, // Carica dati allergeni ma non relazioni annidate
      admin: {
        description: 'Allergeni presenti nel piatto',
      },
    },
    {
      name: 'menuFissi',
      type: 'join',
      collection: 'menu-fisso',
      on: 'piatti',
      label: 'Menu Fissi',
      admin: {
        description: 'Menu fissi che includono questo piatto (sola lettura)',
      },
    },
  ],
  hooks: {
    // Quando un piatto viene eliminato, rimuovi la referenza da tutti i menu fissi
    beforeDelete: [createCleanupHook({ targetCollection: 'menu-fisso', relationshipField: 'piatti' })],
  },
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
