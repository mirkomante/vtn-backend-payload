import { createCategoriaCollection } from './factories/createCategoriaCollection'

export const CategoriaMenuFisso = createCategoriaCollection({
  slug: 'categoria-menu-fisso',
  singular: 'Categoria Menu Fisso',
  plural: 'Categorie Menu Fisso',
  descrizioneDescription: 'Descrizione opzionale della categoria',
  inListaDescription: 'Se la categoria è visibile nel menu',
})
