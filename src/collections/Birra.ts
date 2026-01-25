import { createBevandaCollection } from './factories/createBevandaCollection'

export const Birra = createBevandaCollection({
  slug: 'birre',
  singular: 'Birra',
  plural: 'Birre',
  tipologiaSlug: 'tipologie-birra',
  campiAggiuntivi: {
    grado: true,
    capacita: true,
  },
})
