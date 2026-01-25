'use client'

import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React from 'react'

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
  const docInfo = documentInfo as any
  const collectionSlug =
    docInfo?.collection ||
    docInfo?.collectionSlug

  const globalSlug =
    docInfo?.global ||
    docInfo?.globalSlug

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

  // Prova a ottenere il componente originale dai props
  const ButtonComponent = props.DefaultButton || props.defaultButton

  return (
    <div className="twflex twitems-center twgap-2">
      {/* Bottone Annulla - ora a sinistra */}
      <button
        type="button"
        onClick={handleCancel}
        className="twpx-4 twpy-2 twbg-transparent twborder twborder-payload-border twrounded-s-payload twtext-payload-text twcursor-pointer twtext-sm twfont-medium twtransition-all twduration-200 hover:twbg-payload-elevation-100"
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
