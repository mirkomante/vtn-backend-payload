'use client'

import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'

export default function NavFooter() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        borderTop: '1px solid var(--theme-elevation-150)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ThemeToggle />
      </div>
      <LogoutButton />
    </div>
  )
}
