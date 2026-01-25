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
      className="px-4 py-2 bg-transparent border border-[var(--theme-border-color)] rounded-[var(--border-radius-s)] text-[var(--theme-text)] cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--theme-elevation-100)]"
    >
      {t('general:cancel') || 'Annulla'}
    </button>
  )
}

export default CancelButton
