import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../access/menuImpostazioniAccess'
import { nomeField, descrizioneField } from './fields/commonFields'
import { createCleanupHook } from '../hooks/cleanupRelationships'
import { createSmartWebhook } from '../hooks/smartWebhook'

export const Allergene: CollectionConfig = {
  slug: 'allergeni',
  labels: {
    singular: 'Allergene',
    plural: 'Allergeni',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante configurazione',
    defaultColumns: ['nome', 'descrizione', '_status', 'createdAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dettagli',
          fields: [
            nomeField({ description: "Nome dell'allergene (es. 'Glutine', 'Latte', 'Uova')" }),
            descrizioneField({ description: "Descrizione opzionale dell'allergene" }),
          ],
        },
        {
          label: 'Utilizzo',
          fields: [
            {
              name: 'piatti',
              type: 'join',
              collection: 'piatti',
              on: 'allergeni',
              label: 'Piatti',
              admin: {
                description: 'Elenco dei piatti che contengono questo allergene (sola lettura)',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    // Quando un allergene viene modificato, aggiorna disponibilita.json (Fast Path)
    afterChange: [createSmartWebhook()],
    // Quando un allergene viene eliminato, rimuovi la referenza da tutti i piatti
    beforeDelete: [createCleanupHook({ targetCollection: 'piatti', relationshipField: 'allergeni' })],
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
