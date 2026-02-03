'use client'

import { useState, useCallback } from 'react'
import { toast } from '@payloadcms/ui'

type Props = {
  cellData: boolean | null | undefined
  rowData: { id: string }
  collectionSlug: string
}

/**
 * Componente Toggle interattivo per il campo inLista.
 * Permette di attivare/disattivare la visibilità nel menu pubblico
 * direttamente dalla vista lista, con PATCH + Publish immediato.
 */
export const InListaToggleCell = ({ cellData, rowData, collectionSlug }: Props) => {
  const [checked, setChecked] = useState(Boolean(cellData))
  const [loading, setLoading] = useState(false)

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      // Previeni la propagazione per non aprire il dettaglio del documento
      e.stopPropagation()
      e.preventDefault()

      setLoading(true)
      const newValue = !checked

      try {
        const res = await fetch(`/api/${collectionSlug}/${rowData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            inLista: newValue,
            _status: 'published', // Pubblica immediatamente
          }),
        })

        if (res.ok) {
          setChecked(newValue)
          toast.success(newValue ? 'Aggiunto al menu' : 'Rimosso dal menu')
        } else {
          const errorData = await res.json().catch(() => ({}))
          console.error('Toggle inLista error:', errorData)
          toast.error('Errore durante l\'aggiornamento')
        }
      } catch (error) {
        console.error('Toggle inLista fetch error:', error)
        toast.error('Errore di connessione')
      } finally {
        setLoading(false)
      }
    },
    [checked, rowData.id, collectionSlug],
  )

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Rimuovi dal menu' : 'Aggiungi al menu'}
      title={checked ? 'Rimuovi dal menu' : 'Aggiungi al menu'}
      onClick={handleToggle}
      disabled={loading}
      className="relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        width: '36px',
        height: '20px',
        backgroundColor: checked
          ? 'var(--theme-success-500, #22c55e)'
          : 'var(--theme-elevation-300, #d1d5db)',
      }}
    >
      {/* Spinner durante il caricamento */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin"
            style={{ 
              width: '12px', 
              height: '12px',
              color: checked ? 'white' : 'var(--theme-text)' 
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {/* Toggle knob - posizionato con absolute per centraggio perfetto */}
      <span
        className="pointer-events-none absolute rounded-full bg-white shadow transition-transform duration-200 ease-in-out"
        style={{
          width: '16px',
          height: '16px',
          top: '50%',
          left: '2px',
          transform: checked 
            ? 'translateX(16px) translateY(-50%)' 
            : 'translateY(-50%)',
          opacity: loading ? 0 : 1,
        }}
      />
    </button>
  )
}
