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
      className="p-2 bg-transparent border border-[var(--theme-border-color)] rounded-[var(--border-radius-s)] text-[var(--theme-text)] cursor-pointer flex items-center justify-center gap-2 min-w-fit h-10 transition-all duration-200 text-sm hover:bg-[var(--theme-elevation-100)]"
      aria-label={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
      title={`Cambia lingua. Lingua corrente: ${currentLanguage}`}
    >
      <span>{flag}</span>
      <span>{currentLanguage}</span>
    </button>
  )
}
