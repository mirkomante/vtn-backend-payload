import type { CollectionConfig } from 'payload'

export const Allergene: CollectionConfig = {
  slug: 'allergeni',
  labels: {
    singular: 'Allergene',
    plural: 'Allergeni',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Menu impostazioni',
    defaultColumns: ['nome', 'descrizione', '_status', 'createdAt'],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Nome',
      admin: {
        description: "Nome dell'allergene (es. 'Glutine', 'Latte', 'Uova')",
      },
    },
    {
      name: 'descrizione',
      type: 'textarea',
      label: 'Descrizione',
      admin: {
        description: "Descrizione opzionale dell'allergene",
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
