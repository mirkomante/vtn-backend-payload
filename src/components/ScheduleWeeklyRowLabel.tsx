'use client'

import { useRowLabel } from '@payloadcms/ui'

type ScheduleWeeklyData = {
  day?: string
}

const dayLabels: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
}

export default function ScheduleWeeklyRowLabel() {
  const { data, rowNumber } = useRowLabel<ScheduleWeeklyData>()
  const day = data?.day
  if (day && dayLabels[day]) return <>{dayLabels[day]}</>
  const num = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <>Nuovo Giorno {num}</>
}
