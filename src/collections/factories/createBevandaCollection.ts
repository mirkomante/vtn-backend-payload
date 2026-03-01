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
import { createSmartWebhook } from '../../hooks/smartWebhook'

interface BevandaCollectionOptions {
  slug: string
  singular: string
  plural: string
  tipologiaSlug: string // es. 'tipologie-vino'
  defaultColumns?: string[]
  nazioneOptional?: boolean // Se true, il campo nazione non è obbligatorio
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
  const nazioneRequired = options.nazioneOptional !== true
  const fields: Field[] = []

  // Sidebar: campo inLista
  const inListaFieldBase = inListaField({
    description: `Se ${options.singular.toLowerCase()} è visibile nel menu pubblico`,
    defaultValue: true,
    collectionSlug: options.slug,
  })
  fields.push({
    ...inListaFieldBase,
    admin: {
      ...inListaFieldBase.admin,
      position: 'sidebar',
    },
  } as Field)

  // Costruzione dei tabs
  const tabs: any[] = []

  // Tab 1: Scheda Prodotto
  const schedaProdottoFields: Field[] = []
  schedaProdottoFields.push(
    nomeField({ description: `Nome ${options.singular.toLowerCase()}` }),
    descrizioneField({ description: `Descrizione opzionale ${options.singular.toLowerCase()}` }),
  )

  // Row con prezzo e prezzoCalice (se presente)
  const prezziRowFields: Field[] = []
  const prezzoFieldBase = prezzoField({
    description:
      options.slug === 'vini'
        ? 'Prezzo della bottiglia (max 10 cifre, 2 decimali)'
        : 'Prezzo (max 10 cifre, 2 decimali)',
  })
  prezziRowFields.push({
    ...prezzoFieldBase,
    admin: {
      ...prezzoFieldBase.admin,
      width: campiAggiuntivi.prezzoCalice ? '50%' : '100%',
    },
  } as Field)

  if (campiAggiuntivi.prezzoCalice) {
    const prezzoCaliceFieldBase = prezzoCaliceField({
      description: 'Prezzo per calice (max 10 cifre, 2 decimali)',
    })
    prezziRowFields.push({
      ...prezzoCaliceFieldBase,
      admin: {
        ...prezzoCaliceFieldBase.admin,
        width: '50%',
      },
    } as Field)
  }

  if (prezziRowFields.length > 1) {
    schedaProdottoFields.push({
      type: 'row',
      fields: prezziRowFields,
    })
  } else {
    schedaProdottoFields.push(...prezziRowFields)
  }

  // Tipologia
  schedaProdottoFields.push({
    name: 'tipologia',
    type: 'relationship',
    relationTo: options.tipologiaSlug as any,
    required: true,
    label: 'Tipologia',
    maxDepth: 1,
    index: true,
    admin: {
      description: `Tipologia ${options.singular.toLowerCase()}`,
    },
  })

  tabs.push({
    label: 'Scheda Prodotto',
    fields: schedaProdottoFields,
  })

  // Tab 2: Caratteristiche (solo se ci sono campi tecnici)
  const caratteristicheFields: Field[] = []

  // Row con grado e capacita (se presenti)
  const gradoCapacitaRowFields: Field[] = []
  if (campiAggiuntivi.grado) {
    const gradoFieldBase = gradoField({
      description:
        options.slug === 'vini'
          ? 'Grado alcolico (es. "13.5%", "12%")'
          : options.slug === 'birre'
            ? 'Grado alcolico (es. "5.2%", "4.5%")'
            : 'Grado alcolico (es. "40%", "35%")',
    })
    gradoCapacitaRowFields.push({
      ...gradoFieldBase,
      admin: {
        ...gradoFieldBase.admin,
        width: campiAggiuntivi.capacita ? '50%' : '100%',
      },
    } as Field)
  }

  if (campiAggiuntivi.capacita) {
    const capacitaFieldBase = capacitaField({
      description:
        options.slug === 'vini'
          ? 'Capacità della bottiglia (es. "750ml", "1L")'
          : options.slug === 'birre'
            ? 'Capacità (es. "33cl", "50cl", "1L")'
            : 'Capacità (es. "50ml", "70cl", "1L")',
    })
    gradoCapacitaRowFields.push({
      ...capacitaFieldBase,
      admin: {
        ...capacitaFieldBase.admin,
        width: campiAggiuntivi.grado ? '50%' : '100%',
      },
    } as Field)
  }

  if (gradoCapacitaRowFields.length > 1) {
    caratteristicheFields.push({
      type: 'row',
      fields: gradoCapacitaRowFields,
    })
  } else if (gradoCapacitaRowFields.length === 1) {
    caratteristicheFields.push(...gradoCapacitaRowFields)
  }

  // Anno (solo Vino)
  if (campiAggiuntivi.anno) {
    caratteristicheFields.push({
      name: 'anno',
      type: 'text',
      label: 'Anno',
      admin: {
        description: 'Anno di produzione (es. "2020", "2018", "NV" per non vintage)',
      },
    })
  }

  // Cantina (solo Vino)
  if (campiAggiuntivi.cantina) {
    caratteristicheFields.push({
      name: 'cantina',
      type: 'text',
      label: 'Cantina',
      admin: {
        description: 'Nome della cantina produttrice',
      },
    })
  }

  // Certificazione (solo Vino)
  if (campiAggiuntivi.certificazione) {
    caratteristicheFields.push({
      name: 'certificazione',
      type: 'text',
      label: 'Certificazione',
      admin: {
        description: 'Certificazione (es. DOC, DOCG, IGT)',
      },
    })
  }

  // Invecchiamento (solo Liquore)
  if (campiAggiuntivi.invecchiamento) {
    caratteristicheFields.push({
      name: 'invecchiamento',
      type: 'text',
      label: 'Invecchiamento',
      admin: {
        description: 'Invecchiamento (es. "12 anni", "8 mesi", "Non invecchiato")',
      },
    })
  }

  // Aggiungi tab Caratteristiche solo se ci sono campi
  if (caratteristicheFields.length > 0) {
    tabs.push({
      label: 'Caratteristiche',
      fields: caratteristicheFields,
    })
  }

  // Tab 3: Origine
  const origineFields: Field[] = []

  origineFields.push({
    name: 'nazione',
    type: 'relationship',
    relationTo: 'nazioni',
    required: nazioneRequired,
    label: 'Nazione',
    maxDepth: 0,
    index: true,
    admin: {
      description:
        options.slug === 'cocktail'
          ? 'Nazione di origine del cocktail'
          : 'Nazione di produzione',
    },
  })

  if (campiAggiuntivi.regioneZona) {
    origineFields.push({
      name: 'regione',
      type: 'relationship',
      relationTo: 'regioni',
      label: 'Regione',
      maxDepth: 0,
      index: true,
      admin: {
        description: 'Regione di produzione (opzionale)',
      },
    })

    origineFields.push({
      name: 'zona',
      type: 'relationship',
      relationTo: 'zone',
      label: 'Zona',
      maxDepth: 0,
      index: true,
      admin: {
        description: 'Zona di produzione (opzionale)',
      },
    })
  }

  tabs.push({
    label: 'Origine',
    fields: origineFields,
  })

  // Aggiungi la struttura tabs ai fields
  fields.push({
    type: 'tabs',
    tabs,
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
    defaultSort: 'updatedAt',
    fields,
    hooks: {
      // Quando una bevanda viene modificata, aggiorna disponibilita.json o trigge rebuild
      afterChange: [createSmartWebhook()],
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
}
