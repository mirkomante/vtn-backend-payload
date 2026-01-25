import { createBevandaCollection } from './factories/createBevandaCollection'

export const Liquore = createBevandaCollection({
  slug: 'liquori',
  singular: 'Liquore',
  plural: 'Liquori',
  tipologiaSlug: 'tipologie-liquore',
  campiAggiuntivi: {
    grado: true,
    capacita: true,
    invecchiamento: true,
  },
})
