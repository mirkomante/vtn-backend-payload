import type { Access } from 'payload'

/**
 * Access control comune per le collections del gruppo "Menu impostazioni"
 * Gli admin vedono tutti i documenti, gli altri utenti solo quelli pubblicati
 */
export const menuImpostazioniReadAccess: Access = ({ req: { user } }) => {
  // Gli admin vedono tutti i documenti
  if (user?.roles?.includes('admin')) return true
  // Gli altri utenti vedono solo documenti pubblicati
  return { _status: { equals: 'published' } }
}
