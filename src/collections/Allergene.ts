import { createSimpleCollection } from './factories/createSimpleCollection'

export const Allergene = createSimpleCollection({
  slug: 'allergeni',
  singular: 'Allergene',
  plural: 'Allergeni',
  nomeDescription: "Nome dell'allergene (es. 'Glutine', 'Latte', 'Uova')",
  descrizioneDescription: "Descrizione opzionale dell'allergene",
})
