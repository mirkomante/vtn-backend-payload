import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: {
    disableLocalStrategy: true, // Disabilita login con email/password
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // Include in JWT per accesso rapido
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'sub',
      type: 'text',
      unique: true,
      index: true,
      saveToJWT: true, // Include in JWT per autenticazione OAuth
      admin: {
        hidden: true, // Nascondi nel pannello admin
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, req, data }) => {
        // Se è un'operazione di creazione, controlla se è il primo utente
        if (operation === 'create') {
          const { totalDocs } = await req.payload.find({
            collection: 'users',
            limit: 0,
            depth: 0,
          })

          // Se non ci sono utenti, rendi questo utente admin
          if (totalDocs === 0) {
            data.roles = ['admin']
          }
        }
        return data
      },
    ],
  },
}
