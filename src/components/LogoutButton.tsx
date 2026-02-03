'use client'

import { Button, useAuth } from '@payloadcms/ui'

export default function LogoutButton() {
  const { user } = useAuth()

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
    <Button
      buttonStyle="secondary"
      size="medium"
      onClick={handleLogout}
    >
      Logout
    </Button>
  )
}
