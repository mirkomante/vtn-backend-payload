import type { CollectionConfig, Field } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../access/menuRistoranteAccess'
import { nomeField, descrizioneField, inListaField, prezzoField } from './fields/commonFields'
import { createCleanupHook } from '../hooks/cleanupRelationships'

export const ServizioAccessorio: CollectionConfig = {
  slug: 'servizi-accessori',
  labels: {
    singular: 'Servizio accessorio',
    plural: 'Servizi',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante menu',
    defaultColumns: ['nome', 'inLista', 'prezzo', '_status'],
  },
  fields: [
    // Sidebar: campi di stato/configurazione
    {
      ...inListaField({
        description: 'Se il servizio è visibile nel menu',
        defaultValue: true,
        collectionSlug: 'servizi-accessori',
      }),
      admin: {
        ...inListaField({
          description: 'Se il servizio è visibile nel menu',
          defaultValue: true,
          collectionSlug: 'servizi-accessori',
        }).admin,
        position: 'sidebar',
      },
    } as Field,

    // Tabs: contenuti organizzati per sezioni
    {
      type: 'tabs',
      tabs: [
        // Tab 1: Generale
        {
          label: 'Generale',
          fields: [
            nomeField({ description: 'Nome del servizio (es. "Coperto", "Pane e Grissini")' }),
            prezzoField({ description: 'Prezzo del servizio (max 10 cifre, 2 decimali)' }),
            descrizioneField({ description: 'Descrizione opzionale del servizio' }),
          ],
        },

        // Tab 2: Utilizzo
        {
          label: 'Utilizzo',
          fields: [
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
        },
      ],
    },
  ],
  hooks: {
    // Quando un servizio viene eliminato, rimuovi la referenza da tutti i menu fissi
    beforeDelete: [createCleanupHook({ targetCollection: 'menu-fisso', relationshipField: 'servizi' })],
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
