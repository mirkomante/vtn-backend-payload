'use client'

import { useRowLabel } from '@payloadcms/ui'

type ChiusuraData = {
  reason?: string
}

export default function ChiusuraRowLabel() {
  const { data, rowNumber } = useRowLabel<ChiusuraData>()
  const reason = data?.reason?.trim()
  if (reason) return <>{reason}</>
  const num = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <>Chiusura {num}</>
}
