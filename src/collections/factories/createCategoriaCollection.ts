import type { CollectionConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
  menuImpostazioniDeleteAccess,
} from '../../access/menuImpostazioniAccess'
import { nomeField, descrizioneField, inListaField } from '../fields/commonFields'

interface CategoriaCollectionOptions {
  slug: string
  singular: string
  plural: string
  nomeDescription?: string
  descrizioneDescription?: string
  inListaDescription?: string
  defaultColumns?: string[]
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
      group: 'Ristorante impostazioni',
      defaultColumns:
        options.defaultColumns ||
        ['nome', 'descrizione', 'inLista', '_status', 'createdAt'],
    },
    fields: [
      nomeField({ description: options.nomeDescription }),
      descrizioneField({ description: options.descrizioneDescription }),
      inListaField({ description: options.inListaDescription }),
    ],
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
