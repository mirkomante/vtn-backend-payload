'use client'

import { useState } from 'react'
import { Button } from '@payloadcms/ui'

interface MigrationStats {
  collection: string
  imported: number
  skipped: number
  errors: number
}

interface MigrationResult {
  success: boolean
  stats?: MigrationStats[]
  totalImported?: number
  totalSkipped?: number
  totalErrors?: number
  duration?: number
  error?: string
}

export default function MigrationButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleMigrate = async () => {
    if (
      !confirm(
        '⚠️ ATTENZIONE: Questa operazione eliminerà tutti i dati esistenti (eccetto gli utenti) e li sostituirà con i dati del backend attuale.\n\nSei sicuro di voler continuare?',
      )
    ) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert(`✅ Migrazione completata con successo!\n\n${data.totalImported} documenti importati in ${(data.duration / 1000).toFixed(2)}s`)
      } else {
        alert(`❌ Migrazione fallita: ${data.error || 'Errore sconosciuto'}`)
      }
    } catch (error) {
      console.error('Errore durante la migrazione:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Errore di rete',
      })
      alert('❌ Errore durante la migrazione. Controlla la console per i dettagli.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid var(--theme-elevation-400)',
        borderRadius: '8px',
        backgroundColor: 'var(--theme-elevation-50)',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '20px' }}>
        🔄 Migrazione Dati dal Backend Attuale
      </h2>

      <p style={{ marginBottom: '15px', color: 'var(--theme-elevation-800)' }}>
        Questo strumento importa tutti i dati dal backend attuale (
        <code>vtn-backend-203473363873.europe-west1.run.app</code>) in Payload CMS.
      </p>

      <div
        style={{
          padding: '10px',
          backgroundColor: 'var(--theme-warning-50)',
          border: '1px solid var(--theme-warning-400)',
          borderRadius: '4px',
          marginBottom: '15px',
        }}
      >
        <strong>⚠️ Attenzione:</strong>
        <ul style={{ marginTop: '5px', marginBottom: 0, paddingLeft: '20px' }}>
          <li>Tutti i dati esistenti verranno eliminati (eccetto gli utenti)</li>
          <li>L'operazione può richiedere alcuni minuti</li>
          <li>Non chiudere questa pagina durante la migrazione</li>
        </ul>
      </div>

      <Button onClick={handleMigrate} disabled={loading} buttonStyle="primary">
        {loading ? '⏳ Migrazione in corso...' : '🚀 Avvia Migrazione'}
      </Button>

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: result.success
              ? 'var(--theme-success-50)'
              : 'var(--theme-error-50)',
            border: `1px solid ${result.success ? 'var(--theme-success-400)' : 'var(--theme-error-400)'}`,
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
            {result.success ? '✅ Migrazione Completata' : '❌ Migrazione Fallita'}
          </h3>

          {result.error && (
            <p style={{ color: 'var(--theme-error-800)', marginBottom: '10px' }}>
              <strong>Errore:</strong> {result.error}
            </p>
          )}

          {result.success && result.stats && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Documenti importati:</strong> {result.totalImported}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Errori:</strong> {result.totalErrors}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Tempo impiegato:</strong> {((result.duration || 0) / 1000).toFixed(2)}s
                </p>
              </div>

              <Button
                onClick={() => setShowDetails(!showDetails)}
                buttonStyle="secondary"
                size="small"
              >
                {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
              </Button>

              {showDetails && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Dettagli per collection:</h4>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: 'var(--theme-elevation-100)' }}>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--theme-elevation-300)' }}>
                          Collection
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right', border: '1px solid var(--theme-elevation-300)' }}>
                          Importati
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right', border: '1px solid var(--theme-elevation-300)' }}>
                          Errori
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.stats.map((stat) => (
                        <tr key={stat.collection}>
                          <td style={{ padding: '8px', border: '1px solid var(--theme-elevation-300)' }}>
                            {stat.collection}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', border: '1px solid var(--theme-elevation-300)' }}>
                            {stat.imported}
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'right',
                              border: '1px solid var(--theme-elevation-300)',
                              color: stat.errors > 0 ? 'var(--theme-error-600)' : 'inherit',
                            }}
                          >
                            {stat.errors}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
