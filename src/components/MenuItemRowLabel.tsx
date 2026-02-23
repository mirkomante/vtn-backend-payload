'use client'

import { useRowLabel } from '@payloadcms/ui'

type MenuItemData = {
  label?: string
}

export default function MenuItemRowLabel() {
  const { data, rowNumber } = useRowLabel<MenuItemData>()
  const title = data?.label?.trim()
  if (title) return <>{title}</>
  const num = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <>Sezione {num}</>
}
