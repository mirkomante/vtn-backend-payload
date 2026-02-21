'use client'

import { useState } from 'react'
import { Button, useField, useForm } from '@payloadcms/ui'

// Tipo minimo per le festività restituite da date-holidays
interface HolidayEntry {
  date: string // formato 'YYYY-MM-DD HH:mm:ss'
  name: string
  type: string
}

/**
 * Componente UI personalizzato per il Global "Generali".
 * Appare in cima alla Tab "Eccezioni & Festività" e permette di importare
 * automaticamente le festività italiane dell'anno corrente nell'array `exceptions`.
 *
 * Utilizza la libreria `date-holidays` (server-side via fetch) per calcolare
 * le feste nazionali italiane e popola il campo `exceptions` del form.
 */
export default function ImportaFestivitaButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Accesso diretto al campo `exceptions` tramite hook Payload UI
  const { setValue: setExceptions, value: currentExceptions } = useField<
    Array<{
      date: string
      type: string
      reason: string
      variedHours: unknown[]
    }>
  >({ path: 'exceptions' })

  const handleImport = async () => {
    if (
      !confirm(
        `Vuoi importare le festività italiane del ${new Date().getFullYear()}?\n\nLe festività già presenti con la stessa data verranno saltate.`,
      )
    ) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Carica date-holidays dinamicamente (evita bundle server-side nel client component)
      const { default: Holidays } = await import('date-holidays')
      const hd = new Holidays('IT')
      const year = new Date().getFullYear()
      const holidays: HolidayEntry[] = hd.getHolidays(year) as HolidayEntry[]

      // Filtra solo le festività pubbliche nazionali
      const publicHolidays = holidays.filter((h) => h.type === 'public')

      // Normalizza le date esistenti per evitare duplicati
      const existingDates = new Set(
        ((currentExceptions as typeof currentExceptions) || []).map((e) => {
          if (!e?.date) return ''
          return e.date.split('T')[0]
        }),
      )

      // Costruisce le nuove eccezioni da aggiungere
      const newExceptions = publicHolidays
        .filter((h) => {
          const dateStr = h.date.split(' ')[0] // 'YYYY-MM-DD'
          return !existingDates.has(dateStr)
        })
        .map((h) => ({
          date: h.date.split(' ')[0] + 'T00:00:00.000Z',
          type: 'chiusura-totale' as const,
          reason: h.name,
          variedHours: [],
        }))

      if (newExceptions.length === 0) {
        setMessage({
          type: 'success',
          text: `Tutte le ${publicHolidays.length} festività del ${year} sono già presenti.`,
        })
        return
      }

      // Unisce le eccezioni esistenti con le nuove
      const merged = [...((currentExceptions as typeof currentExceptions) || []), ...newExceptions]
      setExceptions(merged)

      setMessage({
        type: 'success',
        text: `✅ Importate ${newExceptions.length} festività italiane del ${year}. Salva il documento per confermare.`,
      })
    } catch (err) {
      console.error('[ImportaFestivita] Errore:', err)
      setMessage({
        type: 'error',
        text: `❌ Errore durante l'importazione: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '8px',
        backgroundColor: 'var(--theme-elevation-50)',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
            Importa Festività Italiane
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
            Popola automaticamente l&apos;array sottostante con le festività nazionali del{' '}
            <strong>{new Date().getFullYear()}</strong>. Le date già presenti vengono saltate.
          </p>
        </div>
        <Button onClick={handleImport} disabled={loading} buttonStyle="secondary" size="small">
          {loading ? '⏳ Importazione...' : `📅 Importa Festività ${new Date().getFullYear()}`}
        </Button>
      </div>

      {message && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px',
            backgroundColor:
              message.type === 'success' ? 'var(--theme-success-50)' : 'var(--theme-error-50)',
            border: `1px solid ${message.type === 'success' ? 'var(--theme-success-400)' : 'var(--theme-error-400)'}`,
            color:
              message.type === 'success' ? 'var(--theme-success-800)' : 'var(--theme-error-800)',
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
