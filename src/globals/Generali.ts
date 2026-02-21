import type { GlobalConfig, OptionObject } from 'payload'
import {
  menuImpostazioniReadAccess,
  menuImpostazioniUpdateAccess,
} from '../access/menuImpostazioniAccess'

/**
 * Global "Generali" — Single Source of Truth per orari e aperture del ristorante.
 *
 * Struttura:
 *  - Tab 1 "Orari Settimanali": configurazione per ogni giorno della settimana
 *    con flag isOpen e array di fasce orarie (start/end).
 *  - Tab 2 "Fasce Pranzo/Cena": definisce i range temporali usati dal frontend
 *    per determinare se mostrare il menu "Solo Pranzo" o "Solo Cena".
 *  - Tab 3 "Chiusure e Festività": gestione di chiusure straordinarie e orari
 *    variati, con bottone per importare automaticamente le festività italiane.
 *
 * Group: "Ristorante impostazioni" — voce dedicata, gruppo separato dalle collections.
 */

// Genera opzioni HH:MM ogni 15 minuti (00:00 → 23:45)
function buildTimeOptions(): OptionObject[] {
  const opts: OptionObject[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const val = `${hh}:${mm}`
      opts.push({ label: val, value: val })
    }
  }
  return opts
}

const timeOptions = buildTimeOptions()

const timeField = (name: 'start' | 'end', label: string) =>
  ({
    name,
    type: 'select' as const,
    label,
    required: true,
    options: timeOptions,
    admin: {
      width: '50%',
    },
  }) as const

export const Generali: GlobalConfig = {
  slug: 'generali',
  label: 'Generali',
  admin: {
    group: 'Ristorante impostazioni',
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
        // TAB 1: Orari Settimanali
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Orari Settimanali',
          description:
            'Configura gli orari di apertura per ogni giorno della settimana. Questi dati sono la fonte primaria per la disponibilità del ristorante.',
          fields: [
            {
              name: 'scheduleWeekly',
              type: 'array',
              label: 'Giorni della Settimana',
              minRows: 7,
              maxRows: 7,
              admin: {
                description:
                  'Configura i 7 giorni della settimana. Ogni riga rappresenta un giorno.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'day',
                      type: 'select',
                      label: 'Giorno',
                      required: true,
                      options: [
                        { label: 'Lunedì', value: 'monday' },
                        { label: 'Martedì', value: 'tuesday' },
                        { label: 'Mercoledì', value: 'wednesday' },
                        { label: 'Giovedì', value: 'thursday' },
                        { label: 'Venerdì', value: 'friday' },
                        { label: 'Sabato', value: 'saturday' },
                        { label: 'Domenica', value: 'sunday' },
                      ],
                      admin: {
                        width: '30%',
                      },
                    },
                    {
                      name: 'isOpen',
                      type: 'checkbox',
                      label: 'Aperto',
                      defaultValue: true,
                      admin: {
                        width: '20%',
                        description: 'Il ristorante è aperto questo giorno?',
                      },
                    },
                  ],
                },
                {
                  name: 'hours',
                  type: 'array',
                  label: 'Fasce Orarie',
                  admin: {
                    description:
                      'Aggiungi una o più fasce orarie (es. 12:00–15:00 per pranzo, 19:00–23:00 per cena).',
                    condition: (data, siblingData) => siblingData?.isOpen === true,
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [timeField('start', 'Apertura'), timeField('end', 'Chiusura')],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────────────
        // TAB 2: Definizioni Fasce (Logica Frontend)
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Fasce Pranzo / Cena',
          description:
            "Definisce i range temporali che il frontend usa per determinare se mostrare il menu \"Solo Pranzo\" o \"Solo Cena\". Questi valori sono indipendenti dagli orari di apertura.",
          fields: [
            {
              name: 'lunchSlot',
              type: 'group',
              label: 'Fascia Pranzo',
              admin: {
                description:
                  "Intervallo di tempo in cui il ristorante serve il pranzo. Il frontend mostra il menu pranzo se l'orario corrente è compreso in questo range.",
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    timeField('start', 'Inizio Pranzo'),
                    timeField('end', 'Fine Pranzo'),
                  ],
                },
              ],
            },
            {
              name: 'dinnerSlot',
              type: 'group',
              label: 'Fascia Cena',
              admin: {
                description:
                  "Intervallo di tempo in cui il ristorante serve la cena. Il frontend mostra il menu cena se l'orario corrente è compreso in questo range.",
              },
              fields: [
                {
                  type: 'row',
                  fields: [timeField('start', 'Inizio Cena'), timeField('end', 'Fine Cena')],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────────────
        // TAB 3: Chiusure e Festività
        // ─────────────────────────────────────────────────────────────────────
        {
          label: 'Chiusure e Festività',
          description:
            'Gestisci chiusure straordinarie, festività e orari variati. Queste eccezioni hanno priorità sugli orari settimanali standard.',
          fields: [
            {
              name: 'importaFestivitaUI',
              type: 'ui',
              admin: {
                components: {
                  Field: './components/ImportaFestivitaButton',
                },
              },
            },
            {
              name: 'exceptions',
              type: 'array',
              label: 'Chiusure',
              admin: {
                description: 'Lista delle chiusure. Sovrascrivono gli orari settimanali.',
                initCollapsed: true,
                components: {
                  RowLabel: './components/ChiusuraRowLabel',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'date',
                      type: 'date',
                      label: 'Data',
                      required: true,
                      admin: {
                        width: '33%',
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd/MM/yyyy',
                        },
                        description: "Data dell'eccezione",
                      },
                    },
                    {
                      name: 'type',
                      type: 'select',
                      label: 'Tipo',
                      required: true,
                      defaultValue: 'chiusura-totale',
                      options: [
                        { label: 'Chiusura Totale', value: 'chiusura-totale' },
                        { label: 'Orario Variato', value: 'orario-variato' },
                      ],
                      admin: {
                        width: '33%',
                        description: 'Tipo di eccezione',
                      },
                    },
                    {
                      name: 'reason',
                      type: 'text',
                      label: 'Motivo',
                      admin: {
                        width: '34%',
                        placeholder: 'es. Ferie, Pasquetta, Evento privato',
                        description: 'Descrizione opzionale del motivo',
                      },
                    },
                  ],
                },
                {
                  name: 'variedHours',
                  type: 'array',
                  label: 'Cambio orario',
                  admin: {
                    description:
                      'Fasce orarie speciali per questo giorno (visibile solo se il tipo è "Orario Variato").',
                    condition: (data, siblingData) => siblingData?.type === 'orario-variato',
                    components: {
                      RowLabel: './components/CambioOrarioRowLabel',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [timeField('start', 'Apertura'), timeField('end', 'Chiusura')],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
