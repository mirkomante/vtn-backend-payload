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
      Logout
    </button>
  )
}
