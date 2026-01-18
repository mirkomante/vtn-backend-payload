import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { OAuth2Plugin } from 'payload-oauth2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        login: {
          Component: './components/LoginView.tsx',
        },
      },
      actions: ['./components/ThemeToggle', './components/LogoutButton'],
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    OAuth2Plugin({
      strategyName: 'google',
      serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
      authCollection: Users.slug,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      providerAuthorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: ['openid', 'profile', 'email'],
      prompt: 'select_account',
      authorizePath: '/oauth/google/authorize',
      callbackPath: '/oauth/google/callback',
      getUserInfo: async (accessToken) => {
        const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        const userinfo = await response.json()
        return {
          email: userinfo.email,
          name: userinfo.name,
          sub: userinfo.sub, // Campo sub necessario per il JWT token
        }
      },
      successRedirect: async (req, accessToken) => {
        // Reindirizza alla dashboard admin dopo il login
        // Usa percorso relativo per evitare problemi con il cookie
        return '/admin'
      },
      failureRedirect: (req, error) => {
        return '/admin/login?error=oauth_failed'
      },
    }),
  ],
})
