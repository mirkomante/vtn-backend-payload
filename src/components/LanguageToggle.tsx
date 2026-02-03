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
    const newLocale = String(locale) === 'it' ? 'en' : 'it'
    await setPreference('locale', newLocale)
  }

  const currentLanguage = String(locale) === 'it' ? 'Italiano' : 'English'
  const flag = String(locale) === 'it' ? '🇮🇹' : '🇬🇧'

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn--style-pill btn--size-medium btn--no-margin"
      aria-label={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
      title={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'calc(var(--base) * 0.3)',
      }}
    >
      <span>{flag}</span>
      <span>{currentLanguage}</span>
    </button>
  )
}
