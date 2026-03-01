import type { GlobalConfig } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
} from '../access/menuImpostazioniAccess'

/**
 * Global "Ordinamento Menu" — Ordine visuale e regole di raggruppamento del menu.
 *
 * Definisce due livelli di configurazione per il frontend:
 *  1. Ordine manuale delle categorie/tipologie (tramite array relationship ordinato).
 *  2. Regole automatiche di sort e grouping degli item all'interno di ogni sezione.
 *
 * Il frontend deve leggere questo global per sapere:
 *  - In quale sequenza mostrare le categorie/tipologie.
 *  - Con quale criterio ordinare gli item dentro ogni sezione.
 *  - Se raggruppare gli item per un campo (es. regione per i vini).
 *
 * Group: "Ristorante configurazione"
 */
export const OrdinamentoMenu: GlobalConfig = {
  slug: 'ordinamento-menu',
  label: 'Ordinamento',
  admin: {
    group: 'Ristorante configurazione',
    description:
      'Configura l\'ordine delle categorie nel menu e le regole di ordinamento/raggruppamento degli elementi.',
  },
  access: {
    read: menuImpostazioniReadAccess,
    update: menuImpostazioniUpdateAccess,
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ─────────────────────────────────────────────────────────────────────────
    // SIDEBAR — visibile su tutte le tab
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'noteOrdinamento',
      type: 'textarea',
      label: 'Note',
      admin: {
        position: 'sidebar',
        description: 'Note interne sull\'ordinamento del menu (non visibili nel frontend).',
        rows: 3,
      },
    },
    {
      type: 'tabs',
      tabs: [
        // ─── Tab 1: Piatti ────────────────────────────────────────────────────
        {
          label: 'Piatti',
          fields: [
            {
              name: 'categoriePiatti',
              type: 'relationship',
              relationTo: 'categoria-piatti',
              hasMany: true,
              label: 'Ordine Categorie',
              admin: {
                description:
                  'Trascina le categorie per definire l\'ordine di visualizzazione nel menu. Le categorie non incluse qui vengono mostrate in coda.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'piattiOrderBy',
                  type: 'select',
                  label: 'Ordina Piatti Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                    { label: 'Data inserimento', value: 'createdAt' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento dei piatti all\'interno di ogni categoria.',
                  },
                },
                {
                  name: 'piattiOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'piattiGroupBy',
              type: 'select',
              label: 'Raggruppa Piatti Per',
              defaultValue: 'nessuno',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Sottocategoria', value: 'sottocategoria' },
              ],
              admin: {
                description: 'Se raggruppare i piatti in sottosezioni all\'interno della categoria.',
              },
            },
          ],
        },

        // ─── Tab 2: Vini ──────────────────────────────────────────────────────
        {
          label: 'Vini',
          fields: [
            {
              name: 'tipologieVino',
              type: 'relationship',
              relationTo: 'tipologie-vino',
              hasMany: true,
              label: 'Ordine Tipologie',
              admin: {
                description:
                  'Trascina le tipologie per definire l\'ordine di visualizzazione nella carta vini. Le tipologie non incluse vengono mostrate in coda.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'viniOrderBy',
                  type: 'select',
                  label: 'Ordina Vini Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nazione', value: 'nazione' },
                    { label: 'Regione', value: 'regione' },
                    { label: 'Zona', value: 'zona' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                    { label: 'Annata', value: 'anno' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento dei vini all\'interno di ogni tipologia.',
                  },
                },
                {
                  name: 'viniOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'viniGroupBy',
              type: 'select',
              label: 'Raggruppa Vini Per',
              defaultValue: 'regione',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Nazione', value: 'nazione' },
                { label: 'Regione', value: 'regione' },
                { label: 'Zona', value: 'zona' },
                { label: 'Vitigno', value: 'vitigno' },
              ],
              admin: {
                description:
                  'Se raggruppare i vini in sottosezioni (es. per regione: "Toscana", "Piemonte", ecc.).',
              },
            },
          ],
        },

        // ─── Tab 3: Liquori ───────────────────────────────────────────────────
        {
          label: 'Liquori',
          fields: [
            {
              name: 'tipologieLiquore',
              type: 'relationship',
              relationTo: 'tipologie-liquore',
              hasMany: true,
              label: 'Ordine Tipologie',
              admin: {
                description:
                  'Trascina le tipologie per definire l\'ordine di visualizzazione nella carta liquori.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'liquoriOrderBy',
                  type: 'select',
                  label: 'Ordina Liquori Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nazione', value: 'nazione' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento dei liquori all\'interno di ogni tipologia.',
                  },
                },
                {
                  name: 'liquoriOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'liquoriGroupBy',
              type: 'select',
              label: 'Raggruppa Liquori Per',
              defaultValue: 'nazione',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Nazione', value: 'nazione' },
              ],
              admin: {
                description: 'Se raggruppare i liquori per nazione di origine.',
              },
            },
          ],
        },

        // ─── Tab 4: Birre ─────────────────────────────────────────────────────
        {
          label: 'Birre',
          fields: [
            {
              name: 'tipologieBirra',
              type: 'relationship',
              relationTo: 'tipologie-birra',
              hasMany: true,
              label: 'Ordine Tipologie',
              admin: {
                description:
                  'Trascina le tipologie per definire l\'ordine di visualizzazione nella carta birre.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'birreOrderBy',
                  type: 'select',
                  label: 'Ordina Birre Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento delle birre all\'interno di ogni tipologia.',
                  },
                },
                {
                  name: 'birreOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'birreGroupBy',
              type: 'select',
              label: 'Raggruppa Birre Per',
              defaultValue: 'nessuno',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Tipologia', value: 'tipologia' },
                { label: 'Nazione', value: 'nazione' },
              ],
              admin: {
                description: 'Se raggruppare le birre in sottosezioni.',
              },
            },
          ],
        },

        // ─── Tab 5: Cocktail ──────────────────────────────────────────────────
        {
          label: 'Cocktail',
          fields: [
            {
              name: 'tipologieCocktail',
              type: 'relationship',
              relationTo: 'tipologie-cocktail',
              hasMany: true,
              label: 'Ordine Tipologie',
              admin: {
                description:
                  'Trascina le tipologie per definire l\'ordine di visualizzazione nella carta cocktail.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cocktailOrderBy',
                  type: 'select',
                  label: 'Ordina Cocktail Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento dei cocktail all\'interno di ogni tipologia.',
                  },
                },
                {
                  name: 'cocktailOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'cocktailGroupBy',
              type: 'select',
              label: 'Raggruppa Cocktail Per',
              defaultValue: 'nessuno',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Tipologia', value: 'tipologia' },
              ],
              admin: {
                description: 'Se raggruppare i cocktail per tipologia.',
              },
            },
          ],
        },

        // ─── Tab 6: Bevande ───────────────────────────────────────────────────
        {
          label: 'Bevande',
          fields: [
            {
              name: 'tipologieBevanda',
              type: 'relationship',
              relationTo: 'tipologie-bevanda',
              hasMany: true,
              label: 'Ordine Tipologie',
              admin: {
                description:
                  'Trascina le tipologie per definire l\'ordine di visualizzazione nella carta bevande.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bevandeOrderBy',
                  type: 'select',
                  label: 'Ordina Bevande Per',
                  defaultValue: 'order',
                  options: [
                    { label: 'Priorità manuale (campo order)', value: 'order' },
                    { label: 'Nome', value: 'nome' },
                    { label: 'Prezzo', value: 'prezzo' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Criterio di ordinamento delle bevande all\'interno di ogni tipologia.',
                  },
                },
                {
                  name: 'bevandeOrderDirection',
                  type: 'select',
                  label: 'Direzione',
                  defaultValue: 'asc',
                  options: [
                    { label: 'Crescente (A→Z, basso→alto)', value: 'asc' },
                    { label: 'Decrescente (Z→A, alto→basso)', value: 'desc' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'bevandeGroupBy',
              type: 'select',
              label: 'Raggruppa Bevande Per',
              defaultValue: 'nessuno',
              options: [
                { label: 'Nessun raggruppamento', value: 'nessuno' },
                { label: 'Tipologia', value: 'tipologia' },
              ],
              admin: {
                description: 'Se raggruppare le bevande per tipologia.',
              },
            },
          ],
        },
      ],
    },
  ],
}
