import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../access/menuImpostazioniAccess'
import { nomeField, descrizioneField } from './fields/commonFields'
import { createCleanupHook } from '../hooks/cleanupRelationships'

export const Allergene: CollectionConfig = {
  slug: 'allergeni',
  labels: {
    singular: 'Allergene',
    plural: 'Allergeni',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Ristorante impostazioni',
    defaultColumns: ['nome', 'descrizione', '_status', 'createdAt'],
  },
  fields: [
    nomeField({ description: "Nome dell'allergene (es. 'Glutine', 'Latte', 'Uova')" }),
    descrizioneField({ description: "Descrizione opzionale dell'allergene" }),
  ],
  hooks: {
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
