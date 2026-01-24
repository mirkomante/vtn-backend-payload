'use client'

import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React from 'react'

// Prova a importare SaveDraftButton da diversi percorsi possibili
let DefaultSaveDraftButton: React.ComponentType<any> | null = null

try {
  // Prova il percorso più comune
  const uiModule = require('@payloadcms/ui')
  DefaultSaveDraftButton = uiModule.SaveDraftButton || null
} catch (e) {
  // Se non funziona, proveremo altri approcci
}

/**
 * Wrapper per SaveDraftButton che aggiunge il bottone "Annulla" accanto.
 * Questo componente sostituisce il SaveDraftButton standard e mostra
 * sia il bottone "Salva come bozza" che il bottone "Annulla" nella barra degli strumenti.
 */
export default function SaveDraftButtonWithCancel(props: any) {
  const documentInfo = useDocumentInfo()
  const router = useRouter()
  const { t } = useTranslation()

  // useDocumentInfo restituisce { id, collection, ... } dove collection è il slug
  // Verifica tutte le possibili proprietà
  const collectionSlug =
    documentInfo?.collection ||
    (documentInfo as any)?.collectionSlug ||
    (documentInfo as any)?.collection

  const globalSlug =
    (documentInfo as any)?.global ||
    (documentInfo as any)?.globalSlug

  const handleCancel = () => {
    if (collectionSlug) {
      // Per collections: naviga alla lista usando il slug della collection
      router.push(`/admin/collections/${collectionSlug}`)
    } else if (globalSlug) {
      // Per globals: naviga alla vista del global
      router.push(`/admin/globals/${globalSlug}`)
    } else {
      // Fallback: prova a ottenere dalla URL corrente
      const currentPath = window.location.pathname
      const collectionMatch = currentPath.match(/\/admin\/collections\/([^\/]+)/)
      if (collectionMatch) {
        router.push(`/admin/collections/${collectionMatch[1]}`)
      } else {
        router.push('/admin')
      }
    }
  }

  // Prova a ottenere il componente originale
  const ButtonComponent = DefaultSaveDraftButton || props.DefaultButton || props.defaultButton

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Bottone Annulla - ora a sinistra */}
      <button
        type="button"
        onClick={handleCancel}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          border: '1px solid var(--theme-border-color)',
          borderRadius: 'var(--border-radius-s)',
          color: 'var(--theme-text)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {t('general:cancel') || 'Annulla'}
      </button>

      {/* Bottone originale SaveDraftButton - ora a destra */}
      {ButtonComponent ? (
        <ButtonComponent {...props} />
      ) : (
        // Se non riusciamo a ottenere il componente originale, renderizziamo solo il bottone Annulla
        // Il bottone SaveDraftButton originale dovrebbe comunque apparire da Payload
        null
      )}
    </div>
  )
}
