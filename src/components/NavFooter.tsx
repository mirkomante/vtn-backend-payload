'use client'

import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'

export default function NavFooter() {
  return (
    <div className="flex flex-col gap-3 p-4 border-t border-[var(--theme-elevation-150)] mt-auto">
      <div className="flex gap-2 items-center">
        <ThemeToggle />
      </div>
      <LogoutButton />
    </div>
  )
}
