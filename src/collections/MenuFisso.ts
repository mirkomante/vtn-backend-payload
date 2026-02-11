import type { CollectionConfig, Field } from 'payload'
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
    // Sidebar: campi di stato/configurazione
    {
      ...inListaField({
        description: 'Se il menu è visibile nel menu pubblico',
        defaultValue: true,
        collectionSlug: 'menu-fisso',
      }),
      admin: {
        ...inListaField({
          description: 'Se il menu è visibile nel menu pubblico',
          defaultValue: true,
          collectionSlug: 'menu-fisso',
        }).admin,
        position: 'sidebar',
      },
    } as Field,

    // Tabs: contenuti organizzati per sezioni
    {
      type: 'tabs',
      tabs: [
        // Tab 1: Dettagli Menu
        {
          label: 'Dettagli Menu',
          fields: [
            nomeField({ description: 'Nome del menu fisso' }),
            {
              type: 'row',
              fields: [
                {
                  name: 'categoria',
                  type: 'relationship',
                  relationTo: 'categoria-menu-fisso',
                  required: true,
                  label: 'Categoria',
                  maxDepth: 1,
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Categoria del menu fisso',
                  },
                },
                {
                  ...prezzoField({
                    description: 'Prezzo del menu fisso (max 10 cifre, 2 decimali)',
                  }),
                  admin: {
                    ...prezzoField({
                      description: 'Prezzo del menu fisso (max 10 cifre, 2 decimali)',
                    }).admin,
                    width: '50%',
                  },
                } as Field,
              ],
            },
            descrizioneField({ description: 'Descrizione opzionale del menu' }),
          ],
        },

        // Tab 2: Composizione
        {
          label: 'Composizione',
          fields: [
            {
              name: 'piatti',
              type: 'relationship',
              relationTo: 'piatti',
              hasMany: true,
              label: 'Piatti',
              maxDepth: 1,
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
              maxDepth: 1,
              admin: {
                description: 'Servizi inclusi nel menu',
              },
            },
          ],
        },
      ],
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
