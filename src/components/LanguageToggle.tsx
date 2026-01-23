'use client'

import { useLocale, usePreferences } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export default function LanguageToggle() {
  const { setPreference } = usePreferences()
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)

  // Rileva la lingua del browser al primo caricamento
  useEffect(() => {
    if (!mounted && !locale) {
      const browserLang = navigator.language.split('-')[0] // Ottiene 'it' o 'en' da 'it-IT' o 'en-US'
      const supportedLangs = ['it', 'en']

      // Se la lingua del browser è supportata e non c'è ancora una preferenza salvata
      if (supportedLangs.includes(browserLang)) {
        setPreference('locale', browserLang)
      }
      setMounted(true)
    }
  }, [mounted, locale, setPreference])

  const toggleLanguage = async () => {
    const newLocale = locale === 'it' ? 'en' : 'it'
    await setPreference('locale', newLocale)
  }

  const currentLanguage = locale === 'it' ? 'Italiano' : 'English'
  const flag = locale === 'it' ? '🇮🇹' : '🇬🇧'

  return (
    <button
      onClick={toggleLanguage}
      style={{
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: '1px solid var(--theme-border-color)',
        borderRadius: 'var(--border-radius-s)',
        color: 'var(--theme-text)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minWidth: 'fit-content',
        height: '2.5rem',
        transition: 'all 0.2s ease',
        fontSize: '0.875rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      aria-label={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
      title={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
    >
      <span>{flag}</span>
      <span>{currentLanguage}</span>
    </button>
  )
}
