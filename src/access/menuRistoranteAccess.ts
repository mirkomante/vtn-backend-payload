import type { Access } from 'payload'

/**
 * Access control comune per le collections del gruppo "Menu ristorante"
 * Gli admin vedono tutti i documenti, gli altri utenti solo quelli pubblicati
 */
export const menuRistoranteReadAccess: Access = ({ req: { user } }) => {
  // Gli admin vedono tutti i documenti
  if (user?.roles?.includes('admin')) return true
  // Gli altri utenti vedono solo documenti pubblicati
  return { _status: { equals: 'published' } }
}

/**
 * Access control per update nelle collections del gruppo "Menu ristorante"
 * Solo gli admin possono modificare i documenti
 */
export const menuRistoranteUpdateAccess: Access = ({ req: { user } }) => {
  // Solo gli admin possono modificare
  return user?.roles?.includes('admin') || false
}

/**
 * Access control per delete nelle collections del gruppo "Menu ristorante"
 * Solo gli admin possono eliminare i documenti
 */
export const menuRistoranteDeleteAccess: Access = ({ req: { user } }) => {
  // Solo gli admin possono eliminare
  return user?.roles?.includes('admin') || false
}
