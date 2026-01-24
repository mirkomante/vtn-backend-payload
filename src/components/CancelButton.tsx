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
  )
}

export default CancelButton
