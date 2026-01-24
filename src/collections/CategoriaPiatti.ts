import { createCategoriaCollection } from './factories/createCategoriaCollection'

export const CategoriaPiatti = createCategoriaCollection({
  slug: 'categoria-piatti',
  singular: 'Categoria Piatti',
  plural: 'Categorie Piatti',
  descrizioneDescription: 'Descrizione opzionale della categoria',
  inListaDescription: 'Se la categoria è visibile nel menu pubblico',
})
