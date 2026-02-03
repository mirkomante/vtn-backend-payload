import type { CollectionConfig, Field } from 'payload'
import {
  menuRistoranteReadAccess,
  menuRistoranteUpdateAccess,
  menuRistoranteDeleteAccess,
} from '../../access/menuRistoranteAccess'
import {
  nomeField,
  descrizioneField,
  inListaField,
  prezzoField,
  prezzoCaliceField,
  gradoField,
  capacitaField,
} from '../fields/commonFields'

interface BevandaCollectionOptions {
  slug: string
  singular: string
  plural: string
  tipologiaSlug: string // es. 'tipologie-vino'
  defaultColumns?: string[]
  campiAggiuntivi?: {
    grado?: boolean
    capacita?: boolean
    cantina?: boolean
    certificazione?: boolean
    invecchiamento?: boolean
    prezzoCalice?: boolean
    anno?: boolean // Anno di produzione (solo Vino)
    regioneZona?: boolean // Se includere regione e zona
  }
}

/**
 * Factory function per creare collections di bevande con campi comuni e opzionali
 * Usata per: Vino, Birra, Liquore, Cocktail, Bevanda
 */
export function createBevandaCollection(
  options: BevandaCollectionOptions,
): CollectionConfig {
  const campiAggiuntivi = options.campiAggiuntivi || {}
  const fields: Field[] = []

  // Campi base sempre presenti
  fields.push(
    nomeField({ description: `Nome ${options.singular.toLowerCase()}` }),
    descrizioneField({ description: `Descrizione opzionale ${options.singular.toLowerCase()}` }),
  )

  // Campo cantina (solo Vino)
  if (campiAggiuntivi.cantina) {
    fields.push({
      name: 'cantina',
      type: 'text',
      label: 'Cantina',
      admin: {
        description: 'Nome della cantina produttrice',
      },
    })
  }

  // Campo grado alcolico
  if (campiAggiuntivi.grado) {
    fields.push(
      gradoField({
        description:
          options.slug === 'vini'
            ? 'Grado alcolico (es. "13.5%", "12%")'
            : options.slug === 'birre'
              ? 'Grado alcolico (es. "5.2%", "4.5%")'
              : 'Grado alcolico (es. "40%", "35%")',
      }),
    )
  }

  // Campo certificazione (solo Vino)
  if (campiAggiuntivi.certificazione) {
    fields.push({
      name: 'certificazione',
      type: 'text',
      label: 'Certificazione',
      admin: {
        description: 'Certificazione (es. DOC, DOCG, IGT)',
      },
    })
  }

  // Campo anno (solo Vino)
  if (campiAggiuntivi.anno) {
    fields.push({
      name: 'anno',
      type: 'text',
      label: 'Anno',
      admin: {
        description: 'Anno di produzione (es. "2020", "2018", "NV" per non vintage)',
      },
    })
  }

  // Campo invecchiamento (solo Liquore)
  if (campiAggiuntivi.invecchiamento) {
    fields.push({
      name: 'invecchiamento',
      type: 'text',
      label: 'Invecchiamento',
      admin: {
        description: 'Invecchiamento (es. "12 anni", "8 mesi", "Non invecchiato")',
      },
    })
  }

  // Campo capacita
  if (campiAggiuntivi.capacita) {
    fields.push(
      capacitaField({
        description:
          options.slug === 'vini'
            ? 'Capacità della bottiglia (es. "750ml", "1L")'
            : options.slug === 'birre'
              ? 'Capacità (es. "33cl", "50cl", "1L")'
              : 'Capacità (es. "50ml", "70cl", "1L")',
      }),
    )
  }

  // Campo prezzo calice (solo Vino)
  if (campiAggiuntivi.prezzoCalice) {
    fields.push(prezzoCaliceField({ description: 'Prezzo per calice (max 10 cifre, 2 decimali)' }))
  }

  // Campo prezzo (sempre presente)
  fields.push(
    prezzoField({
      description:
        options.slug === 'vini'
          ? 'Prezzo della bottiglia (max 10 cifre, 2 decimali)'
          : 'Prezzo (max 10 cifre, 2 decimali)',
    }),
  )

  // Campo inLista con index e toggle interattivo
  fields.push(
    inListaField({
      description: `Se ${options.singular.toLowerCase()} è visibile nel menu pubblico`,
      defaultValue: true,
      collectionSlug: options.slug,
    }),
  )

  // Relazione nazione (sempre presente) con index e maxDepth
  fields.push({
    name: 'nazione',
    type: 'relationship',
    relationTo: 'nazioni',
    required: true,
    label: 'Nazione',
    maxDepth: 0, // Solo ID per performance
    index: true, // Index per query veloci
    admin: {
      description:
        options.slug === 'cocktail'
          ? 'Nazione di origine del cocktail'
          : 'Nazione di produzione',
    },
  })

  // Relazione regione (solo Vino se regioneZona è true)
  if (campiAggiuntivi.regioneZona) {
    fields.push({
      name: 'regione',
      type: 'relationship',
      relationTo: 'regioni',
      label: 'Regione',
      maxDepth: 0, // Solo ID per performance
      index: true,
      admin: {
        description: 'Regione di produzione (opzionale)',
      },
    })
  }

  // Relazione zona (solo Vino se regioneZona è true)
  if (campiAggiuntivi.regioneZona) {
    fields.push({
      name: 'zona',
      type: 'relationship',
      relationTo: 'zone',
      label: 'Zona',
      maxDepth: 0, // Solo ID per performance
      index: true,
      admin: {
        description: 'Zona di produzione (opzionale)',
      },
    })
  }

  // Relazione tipologia (sempre presente) con index e maxDepth
  fields.push({
    name: 'tipologia',
    type: 'relationship',
    relationTo: options.tipologiaSlug as any,
    required: true,
    label: 'Tipologia',
    maxDepth: 1, // Carica dati tipologia ma non relazioni annidate
    index: true, // Index per query veloci
    admin: {
      description: `Tipologia ${options.singular.toLowerCase()}`,
    },
  })

  return {
    slug: options.slug,
    labels: {
      singular: options.singular,
      plural: options.plural,
    },
    admin: {
      useAsTitle: 'nome',
      group: 'Ristorante menu',
      defaultColumns: options.defaultColumns || [
        'nome',
        'inLista',
        'nazione',
        'prezzo',
        '_status',
      ],
    },
    fields,
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
}
