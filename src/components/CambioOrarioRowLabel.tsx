'use client'

import { useRowLabel } from '@payloadcms/ui'

type CambioOrarioData = {
  start?: string
  end?: string
}

export default function CambioOrarioRowLabel() {
  const { data, rowNumber } = useRowLabel<CambioOrarioData>()
  const { start, end } = data ?? {}
  if (start && end) return <>{`${start} - ${end}`}</>
  const num = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <>Cambio orario {num}</>
}
