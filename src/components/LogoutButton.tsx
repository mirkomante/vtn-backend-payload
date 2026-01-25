'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { user } = useAuth()
  const { config } = useConfig()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok || response.status === 200) {
        // Reindirizza alla pagina di login
        window.location.href = '/admin/login'
      } else {
        console.error('Errore durante il logout:', response.statusText)
        // Prova comunque a reindirizzare
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Errore durante il logout:', error)
      // In caso di errore, reindirizza comunque
      window.location.href = '/admin/login'
    }
  }

  if (!user) {
    return null
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-transparent border border-[var(--theme-border-color)] rounded-[var(--border-radius-s)] text-[var(--theme-text)] cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--theme-elevation-100)]"
    >
      Logout
    </button>
  )
}
