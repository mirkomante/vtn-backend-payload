import type { CollectionConfig, Field } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'
import { createCleanupHook } from '../hooks/cleanupRelationships'
import { createSmartWebhook } from '../hooks/smartWebhook'

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
  defaultSort: 'updatedAt',
  fields: [
    // Sidebar: campi di stato/configurazione
    {
      ...inListaField({
        description: 'Se il piatto è visibile nel menu pubblico',
        defaultValue: true,
        collectionSlug: 'piatti',
      }),
      admin: {
        ...inListaField({
          description: 'Se il piatto è visibile nel menu pubblico',
          defaultValue: true,
          collectionSlug: 'piatti',
        }).admin,
        position: 'sidebar',
      },
    } as Field,
    {
      name: 'soloMenuFissi',
      type: 'checkbox',
      defaultValue: false,
      label: 'Solo Menu Fissi',
      admin: {
        position: 'sidebar',
        description: 'Se il piatto è disponibile solo nei menu fissi (non nel menu pubblico)',
      },
    },
    // Tabs: contenuti organizzati per sezioni
    {
      type: 'tabs',
      tabs: [
        // Tab 1: Scheda Piatto
        {
          label: 'Scheda Piatto',
          fields: [
            nomeField({ description: 'Nome del piatto' }),
            {
              type: 'row',
              fields: [
                {
                  ...prezzoField({
                    description: 'Prezzo del piatto (max 10 cifre, 2 decimali)',
                  }),
                  admin: {
                    ...prezzoField({
                      description: 'Prezzo del piatto (max 10 cifre, 2 decimali)',
                    }).admin,
                    width: '50%',
                  },
                } as Field,
                {
                  name: 'categoria',
                  type: 'relationship',
                  relationTo: 'categoria-piatti',
                  required: true,
                  label: 'Categoria',
                  maxDepth: 1,
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Categoria del piatto',
                  },
                },
              ],
            },
            descrizioneField({ description: 'Descrizione opzionale del piatto' }),
          ],
        },

        // Tab 2: Diete e Allergeni
        {
          label: 'Diete e Allergeni',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'glutenFree',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Senza Glutine',
                  admin: {
                    width: '25%',
                    description: 'Se il piatto è senza glutine',
                  },
                },
                {
                  name: 'noUovo',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'No Uovo',
                  admin: {
                    width: '25%',
                    description: 'Se il piatto non contiene uova',
                  },
                },
                {
                  name: 'noLatticini',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'No Latticini',
                  admin: {
                    width: '25%',
                    description: 'Se il piatto non contiene latticini',
                  },
                },
                {
                  name: 'vegan',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Vegano',
                  admin: {
                    width: '25%',
                    description: 'Se il piatto è vegano',
                  },
                },
              ],
            },
            {
              name: 'allergeni',
              type: 'relationship',
              relationTo: 'allergeni',
              hasMany: true,
              label: 'Allergeni',
              maxDepth: 1,
              admin: {
                description: 'Allergeni presenti nel piatto',
              },
            },
          ],
        },

        // Tab 3: Utilizzo
        {
          label: 'Utilizzo',
          fields: [
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
        },
      ],
    },
  ],
  hooks: {
    // Quando un piatto viene modificato, aggiorna disponibilita.json o trigge rebuild
    afterChange: [createSmartWebhook()],
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
