import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../../access/menuImpostazioniAccess'
import { nomeField, descrizioneField } from '../fields/commonFields'
import { createSmartWebhook } from '../../hooks/smartWebhook'

interface SimpleCollectionOptions {
  slug: string
  singular: string
  plural: string
  nomeDescription?: string
  descrizioneDescription?: string
  defaultColumns?: string[]
}

/**
 * Factory function per creare collections semplici con solo nome + descrizione
 * Usata per: Allergene, TipologiaVino, TipologiaBirra, TipologiaLiquore, TipologiaCocktail, TipologiaBevanda
 */
export function createSimpleCollection(
  options: SimpleCollectionOptions,
): CollectionConfig {
  return {
    slug: options.slug,
    labels: {
      singular: options.singular,
      plural: options.plural,
    },
    admin: {
      useAsTitle: 'nome',
      group: 'Ristorante impostazioni',
      defaultColumns:
        options.defaultColumns || ['nome', 'descrizione', '_status', 'createdAt'],
    },
    fields: [
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
        ],
      },
    ],
    hooks: {
      // Quando una tipologia viene modificata, aggiorna disponibilita.json (Fast Path)
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
