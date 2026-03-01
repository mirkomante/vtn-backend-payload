import type { GlobalConfig, Field } from 'payload'
import { lexicalEditor, BoldFeature, ItalicFeature, UnderlineFeature } from '@payloadcms/richtext-lexical'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
} from '../access/menuImpostazioniAccess'

/**
 * Global "Menu Config" — Struttura e visibilità del menu del ristorante.
 *
 * Definisce quali sezioni mostrare nel frontend e con quali regole di visibilità.
 * Le chiavi di visibilità (`lunch_only`, `dinner_only`) sono logiche: il frontend
 * le mappa sugli orari reali definiti nel Global `generali` (lunchSlot / dinnerSlot).
 *
 * Struttura:
 *  - Tab 1 "Menu Standard (Default)": array `standardItems` — sezioni sempre attive.
 *  - Tab 2 "Menu Speciale (Override)": flag `isActive`, range date `activeRange`,
 *    array `specialItems` — sovrascrive il menu standard nel periodo indicato.
 *
 * Group: "Ristorante configurazione"
 */

/**
 * Campi condivisi per ogni "Item Menu" (usati sia in standardItems che specialItems).
 * Estratti come costante per evitare duplicazione e garantire coerenza.
 */
const menuItemFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    label: 'Titolo Sezione',
    required: true,
    admin: {
      description: 'Titolo della sezione visibile nel frontend (es. "I Nostri Primi")',
    },
  },
  {
    name: 'sourceCollection',
    type: 'select',
    label: 'Sorgente Dati',
    required: true,
    hasMany: true,
    options: [
      { label: 'Piatti', value: 'piatti' },
      { label: 'Vini', value: 'vini' },
      { label: 'Birre', value: 'birre' },
      { label: 'Liquori', value: 'liquori' },
      { label: 'Cocktail', value: 'cocktail' },
      { label: 'Bevande', value: 'bevande' },
      { label: 'Servizi Accessori', value: 'servizi-accessori' },
      { label: 'Menu Fisso', value: 'menu-fisso' },
    ],
    admin: {
      description: 'Collection da cui il frontend legge i dati per questa sezione',
    },
  },
  {
    name: 'filterMode',
    type: 'select',
    label: 'Modalità Filtro',
    required: true,
    defaultValue: 'all',
    options: [
      { label: 'Tutto', value: 'all' },
      { label: 'Includi solo...', value: 'include' },
      { label: 'Escludi...', value: 'exclude' },
    ],
    admin: {
      description:
        'Disponibile solo con una singola sorgente dati. Con più sorgenti vengono mostrati tutti gli elementi.',
      condition: (_data, siblingData) => {
        const src = siblingData?.sourceCollection
        return Array.isArray(src) ? src.length <= 1 : Boolean(src)
      },
    },
  },
  {
    name: 'targetCategories',
    type: 'relationship',
    label: 'Categorie / Tipologie Target',
    relationTo: [
      'categoria-piatti',       // per sourceCollection: 'piatti'
      'tipologie-vino',         // per sourceCollection: 'vini'
      'tipologie-birra',        // per sourceCollection: 'birre'
      'tipologie-liquore',      // per sourceCollection: 'liquori'
      'tipologie-cocktail',     // per sourceCollection: 'cocktail'
      'tipologie-bevanda',      // per sourceCollection: 'bevande'
      'categoria-menu-fisso',   // per sourceCollection: 'menu-fisso'
    ],
    hasMany: true,
    maxDepth: 1,
    // Mostra solo la collection di categorie coerente con la sorgente dati selezionata.
    // Le collection non pertinenti vengono nascoste restituendo `false`.
    filterOptions: ({ relationTo, siblingData }) => {
      const sourceToRelation: Record<string, string> = {
        piatti:              'categoria-piatti',
        vini:                'tipologie-vino',
        birre:               'tipologie-birra',
        liquori:             'tipologie-liquore',
        cocktail:            'tipologie-cocktail',
        bevande:             'tipologie-bevanda',
        'menu-fisso':        'categoria-menu-fisso',
        'servizi-accessori': '', // nessuna categoria disponibile
      }
      const sibling = siblingData as { sourceCollection?: string | string[] }
      const src = sibling?.sourceCollection
      const selectedSource = Array.isArray(src) ? src[0] : src
      const expectedRelation = sourceToRelation[selectedSource as string]
      // Se la collection corrente non corrisponde alla sorgente selezionata, nascondila
      return relationTo === expectedRelation ? true : false
    },
    admin: {
      description:
        'Mostra solo le categorie/tipologie della sorgente dati selezionata.',
      condition: (_data, siblingData) => {
        const src = siblingData?.sourceCollection
        const isSingle = Array.isArray(src) ? src.length <= 1 : Boolean(src)
        return isSingle && (siblingData?.filterMode === 'include' || siblingData?.filterMode === 'exclude')
      },
    },
  },
  {
    name: 'visibility',
    type: 'select',
    label: 'Visibilità',
    required: true,
    defaultValue: 'always',
    options: [
      { label: 'Sempre', value: 'always' },
      { label: 'Solo Pranzo', value: 'lunch_only' },
      { label: 'Solo Cena', value: 'dinner_only' },
    ],
    admin: {
      description:
        'Fascia oraria in cui mostrare questa sezione. "Solo Pranzo" e "Solo Cena" si basano sui range definiti in Generali → Fasce Pranzo/Cena.',
    },
  },
  {
    name: 'icona',
    type: 'upload',
    label: 'Icona Sezione',
    relationTo: 'media-ristorante',
    admin: {
      description: 'Icona opzionale da mostrare accanto al titolo della sezione nel frontend.',
    },
  },
]

export const MenuConfig: GlobalConfig = {
  slug: 'menu-config',
  label: 'Layout',
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Ristorante configurazione',
  },
  access: {
    read: menuImpostazioniReadAccess,
    update: menuImpostazioniUpdateAccess,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────────────────────────────
        // TAB 1: Identità
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Identità',
          description:
            'Elementi di branding del menu: logo del ristorante e annotazione introduttiva.',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              label: 'Logo',
              relationTo: 'media-ristorante',
              admin: {
                description:
                  'Logo del ristorante da mostrare nell\'intestazione del menu digitale.',
              },
            },
            {
              name: 'annotazione',
              type: 'richText',
              label: 'Annotazione',
              editor: lexicalEditor({
                features: [
                  BoldFeature(),
                  ItalicFeature(),
                  UnderlineFeature(),
                ],
              }),
              admin: {
                description:
                  'Testo introduttivo del menu. Supporta solo grassetto, corsivo e sottolineato.',
              },
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────────────
        // TAB 2: Menu Standard
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Menu Standard (Default)',
          description:
            'Configurazione predefinita del menu. Attiva sempre, a meno che il Menu Speciale non sia attivo nel periodo corrente.',
          fields: [
            {
              name: 'standardItems',
              type: 'array',
              label: 'Sezioni Menu Standard',
              admin: {
                description:
                  'Ogni riga rappresenta una sezione del menu (es. "Antipasti", "Vini Rossi").',
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/MenuItemRowLabel',
                },
              },
              fields: menuItemFields,
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────────────
        // TAB 2: Menu Speciale
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Menu Speciale (Override)',
          description:
            'Menu temporaneo che sovrascrive il Menu Standard nel periodo indicato. Utile per eventi, festività o periodi stagionali.',
          fields: [
            {
              name: 'isActive',
              type: 'checkbox',
              label: 'Attiva Menu Speciale',
              defaultValue: false,
              admin: {
                description:
                  'Se abilitato e la data corrente è compresa nel range, il frontend usa specialItems al posto di standardItems.',
              },
            },
            {
              name: 'activeRange',
              type: 'group',
              label: 'Periodo di Attivazione',
              admin: {
                description: 'Intervallo di date in cui il Menu Speciale è attivo.',
                condition: (_data, siblingData) => siblingData?.isActive === true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'start',
                      type: 'date',
                      label: 'Dal...',
                      admin: {
                        width: '50%',
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd/MM/yyyy',
                        },
                        description: 'Data di inizio del Menu Speciale (inclusa)',
                      },
                    },
                    {
                      name: 'end',
                      type: 'date',
                      label: 'Al...',
                      admin: {
                        width: '50%',
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd/MM/yyyy',
                        },
                        description: 'Data di fine del Menu Speciale (inclusa)',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'specialItems',
              type: 'array',
              label: 'Sezioni Menu Speciale',
              admin: {
                description:
                  'Sezioni del menu speciale. Struttura identica al Menu Standard.',
                initCollapsed: true,
                condition: (_data, siblingData) => siblingData?.isActive === true,
                components: {
                  RowLabel: '@/components/MenuItemRowLabel',
                },
              },
              fields: menuItemFields,
            },
          ],
        },
      ],
    },
  ],
}
