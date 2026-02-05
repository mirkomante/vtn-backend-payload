'use client'

type Props = {
  cellData: number | null | undefined
}

/**
 * Componente Cell per visualizzare il prezzo formattato con il simbolo €
 * nella List View delle collection.
 */
export const PrezzoCell = ({ cellData }: Props) => {
  if (cellData === null || cellData === undefined) {
    return <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>
  }

  // Formatta il prezzo con 2 decimali e separatore locale
  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cellData)

  return <span>{formattedPrice}</span>
}
