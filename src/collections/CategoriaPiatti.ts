import type { CollectionConfig } from 'payload'

export const CategoriaPiatti: CollectionConfig = {
  slug: 'categoria-piatti',
  labels: {
    singular: 'Categoria Piatti',
    plural: 'Categorie Piatti',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Menu impostazioni',
    defaultColumns: ['nome', 'descrizione', 'inLista', '_status', 'createdAt'],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Nome',
    },
    {
      name: 'descrizione',
      type: 'textarea',
      label: 'Descrizione',
      admin: {
        description: 'Descrizione opzionale della categoria',
      },
    },
    {
      name: 'inLista',
      type: 'checkbox',
      defaultValue: true,
      label: 'In Lista',
      admin: {
        description: 'Se la categoria è visibile nel menu pubblico',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
  access: {
    read: ({ req: { user } }) => {
      // Gli admin vedono tutti i documenti
      if (user?.roles?.includes('admin')) return true
      // Gli altri utenti vedono solo documenti pubblicati
      return { _status: { equals: 'published' } }
    },
  },
}
