import { createBevandaCollection } from './factories/createBevandaCollection'

export const Cocktail = createBevandaCollection({
  slug: 'cocktail',
  singular: 'Cocktail',
  plural: 'Cocktail',
  tipologiaSlug: 'tipologie-cocktail',
  // Solo campi base, nessun campo aggiuntivo
})
