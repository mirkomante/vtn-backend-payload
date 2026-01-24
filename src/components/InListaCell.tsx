/**
 * Componente Cell personalizzato per il campo inLista
 * Mostra "si" o "no" invece di true/false
 */
export const InListaCell = ({ cellData }: { cellData: boolean | null | undefined }) => {
  return <span>{cellData ? 'si' : 'no'}</span>
}
