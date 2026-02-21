import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { gcsStorage } from '@payloadcms/storage-gcs'
import { en } from '@payloadcms/translations/languages/en'
import { it } from '@payloadcms/translations/languages/it'
import path from 'path'
import { buildConfig, type PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { OAuth2Plugin } from 'payload-oauth2'

import { migrations } from './migrations'
import { Users } from './collections/Users'
import { cancelButtonPlugin } from './plugins/cancelButtonPlugin'
import { Media } from './collections/Media'
import { migrateDataEndpoint } from './endpoints/migrateData'
import { CategoriaMenuFisso } from './collections/CategoriaMenuFisso'
import { CategoriaPiatti } from './collections/CategoriaPiatti'
import { Piatti } from './collections/Piatti'
import { ServizioAccessorio } from './collections/ServizioAccessorio'
import { MenuFisso } from './collections/MenuFisso'
import { Vino } from './collections/Vino'
import { Birra } from './collections/Birra'
import { Liquore } from './collections/Liquore'
import { Cocktail } from './collections/Cocktail'
import { Bevanda } from './collections/Bevanda'
import { Allergene } from './collections/Allergene'
import { Nazione } from './collections/Nazione'
import { Regione } from './collections/Regione'
import { Zona } from './collections/Zona'
import {
  TipologiaVino,
  TipologiaBirra,
  TipologiaLiquore,
  TipologiaCocktail,
  TipologiaBevanda,
} from './collections/Tipologie'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// GCS Storage Plugin - attivo solo in produzione quando GCS_BUCKET è configurato
// In locale i media vengono salvati nella cartella /media del progetto
// Il plugin è SEMPRE incluso nella config (con enabled condizionale) per garantire
// che il componente GcsClientUploadHandler sia sempre presente nell'importMap,
// evitando pagine bianche in produzione.
const gcsEnabled = Boolean(process.env.GCS_BUCKET)
console.log('[GCS Storage] GCS_BUCKET:', process.env.GCS_BUCKET || '(non impostato)')
console.log('[GCS Storage] GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID || '(non impostato)')
console.log('[GCS Storage] Plugin abilitato:', gcsEnabled)

const gcsPlugin = gcsStorage({
  collections: {
    // disableLocalStorage condizionale nel plugin (non nella collection):
    // evita il problema build-time dove Boolean(process.env.GCS_BUCKET) = false
    // perché qui il valore viene valutato a runtime, non compilato nel bundle.
    media: gcsEnabled ? { disableLocalStorage: true } : true,
  },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  options: {
    ...(process.env.GCP_PROJECT_ID && { projectId: process.env.GCP_PROJECT_ID }),
  },
  enabled: gcsEnabled,
})

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
      afterNavLinks: ['./components/NavFooter'],
      beforeDashboard: ['./components/MigrationButton'],
    },
  },
  collections: [
    Users,
    Media,
    Piatti,
    ServizioAccessorio,
    MenuFisso,
    Vino,
    Birra,
    Liquore,
    Cocktail,
    Bevanda,
    Allergene,
    CategoriaMenuFisso,
    CategoriaPiatti,
    TipologiaVino,
    TipologiaBirra,
    TipologiaLiquore,
    TipologiaCocktail,
    TipologiaBevanda,
    Nazione,
    Regione,
    Zona,
  ],
  editor: lexicalEditor(),
  i18n: {
    supportedLanguages: { en, it },
    fallbackLanguage: 'en',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false, // Disabilitato per produzione - usare migrazioni esplicite
    prodMigrations: migrations, // Array delle migrazioni per produzione
  }),
  sharp,
  endpoints: [migrateDataEndpoint],
  plugins: [
    gcsPlugin,
    cancelButtonPlugin(),
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
      successRedirect: async (req: PayloadRequest, accessToken?: string) => {
        // Reindirizza alla dashboard admin dopo il login
        // Usa percorso relativo per evitare problemi con il cookie
        return '/admin'
      },
      failureRedirect: (req: PayloadRequest, error?: any) => {
        return '/admin/login?error=oauth_failed'
      },
    }),
  ],
})
