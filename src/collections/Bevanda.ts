import { createBevandaCollection } from './factories/createBevandaCollection'

export const Bevanda = createBevandaCollection({
  slug: 'bevande',
  singular: 'Bevanda',
  plural: 'Bevande',
  tipologiaSlug: 'tipologie-bevanda',
  // Solo campi base, nessun campo aggiuntivo
})
