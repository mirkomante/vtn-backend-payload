'use client'

import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import type { UIFieldClientComponent } from 'payload'

/**
 * Bottone "Annulla" per le viste di edit di collections e globals.
 * Naviga alla lista della collection o alla vista del global.
 * 
 * Questo componente viene usato come campo UI e viene aggiunto automaticamente
 * a tutte le collections e globals tramite il plugin cancelButtonPlugin.
 */
const CancelButton: UIFieldClientComponent = () => {
  const documentInfo = useDocumentInfo()
  const router = useRouter()
  const { t } = useTranslation()

  // useDocumentInfo può restituire collection o global
  const collection = (documentInfo as any).collection
  const global = (documentInfo as any).global

  const handleCancel = () => {
    if (collection) {
      // Per collections: naviga alla lista
      router.push(`/admin/collections/${collection}`)
    } else if (global) {
      // Per globals: naviga alla vista del global
      router.push(`/admin/globals/${global}`)
    } else {
      // Fallback: torna alla dashboard
      router.push('/admin')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      className="twpx-4 twpy-2 twbg-transparent twborder twborder-payload-border twrounded-s-payload twtext-payload-text twcursor-pointer twtext-sm twfont-medium twtransition-all twduration-200 hover:twbg-payload-elevation-100"
    >
      {t('general:cancel') || 'Annulla'}
    </button>
  )
}

export default CancelButton
