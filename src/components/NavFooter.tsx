'use client'

import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'

export default function NavFooter() {
  return (
    <div className="twflex twflex-col twgap-2 twp-4 twborder-t twborder-payload-elevation-150 twmt-auto">
      <div className="twflex twgap-2 twitems-center twjustify-between">
        <ThemeToggle />
      </div>
      <LogoutButton />
    </div>
  )
}
