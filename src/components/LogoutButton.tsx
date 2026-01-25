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
      className="twpx-4 twpy-2 twbg-transparent twborder twborder-payload-border twrounded-s-payload twtext-payload-text twcursor-pointer twtext-sm twfont-medium twtransition-all twduration-200 hover:twbg-payload-elevation-100"
    >
      Logout
    </button>
  )
}
