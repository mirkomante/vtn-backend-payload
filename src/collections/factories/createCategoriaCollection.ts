import type { CollectionConfig, Field } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../../access/menuImpostazioniAccess'
import { nomeField, descrizioneField, inListaField } from '../fields/commonFields'
import { createSmartWebhook } from '../../hooks/smartWebhook'

interface CategoriaCollectionOptions {
  slug: string
  singular: string
  plural: string
  nomeDescription?: string
  descrizioneDescription?: string
  inListaDescription?: string
  defaultColumns?: string[]
  relatedCollection?: string // Slug della collezione che usa questa categoria
}

/**
 * Factory function per creare collections di categoria con nome + descrizione + inLista
 * Usata per: CategoriaMenuFisso, CategoriaPiatti
 */
export function createCategoriaCollection(
  options: CategoriaCollectionOptions,
): CollectionConfig {
  return {
    slug: options.slug,
    labels: {
      singular: options.singular,
      plural: options.plural,
    },
    admin: {
      useAsTitle: 'nome',
      group: 'Ristorante configurazione',
      defaultColumns:
        options.defaultColumns || ['nome', 'inLista', 'descrizione', '_status'],
    },
    fields: [
      // Sidebar: campo di stato
      {
        ...inListaField({
          description: options.inListaDescription,
          collectionSlug: options.slug,
        }),
        admin: {
          ...inListaField({
            description: options.inListaDescription,
            collectionSlug: options.slug,
          }).admin,
          position: 'sidebar',
        },
      } as Field,

      // Tabs: contenuti organizzati
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Dettagli',
            fields: [
              nomeField({ description: options.nomeDescription }),
              descrizioneField({ description: options.descrizioneDescription }),
            ],
          },
          // Tab Utilizzo (condizionale)
          ...(options.relatedCollection
            ? [
                {
                  label: 'Utilizzo',
                  fields: [
                    {
                      name: 'elementi',
                      type: 'join' as const,
                      collection: options.relatedCollection as any,
                      on: 'categoria',
                      label: 'Elementi',
                      admin: {
                        description: 'Elementi associati a questa categoria',
                      },
                    } as Field,
                  ],
                },
              ]
            : []),
        ],
      },
    ],
    hooks: {
      // Quando una categoria viene modificata, aggiorna disponibilita.json (Fast Path)
      afterChange: [createSmartWebhook()],
    },
    versions: {
      drafts: true,
    },
    timestamps: true,
    access: {
      read: menuImpostazioniReadAccess,
      update: menuImpostazioniUpdateAccess,
      delete: menuImpostazioniDeleteAccess,
    },
  }
}
