import { createBevandaCollection } from './factories/createBevandaCollection'

export const Bevanda = createBevandaCollection({
  slug: 'bevande',
  singular: 'Bevanda',
  plural: 'Bevande',
  tipologiaSlug: 'tipologie-bevanda',
  nazioneOptional: true,
  // Solo campi base, nessun campo aggiuntivo
})
