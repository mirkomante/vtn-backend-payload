# Project Context: Restaurant Menu System

## 🌍 Overview
This project is a Payload CMS (v3.0) backend for managing a restaurant's digital menu, wine list, and configurations. It uses Next.js 15, PostgreSQL, and Google Cloud Storage.

## 🏗 Domain Model (Collections)

### Menu Management
- **`Piatti`**: Dishes with descriptions, prices, allergens, and relationships to categories.
- **`MenuFisso`**: Fixed menus / Tasting menus.
- **`CategoriaPiatti`**: Hierarchical organization of courses (e.g., Antipasti, Primi).
- **`CategoriaMenuFisso`**: Types of fixed menus.

### Beverage Management (Cantina)
- **`Vino`**: Detailed wine sheets (Red, White, Rosé, Sparkling). Nation **required**.
- **`Birra`**: Craft and industrial beers. Nation **required**.
- **`Cocktail`**: Cocktails and mixed drinks. Nation **optional** (international cocktails like Mojito may have no origin).
- **`Liquore`**: Spirits and bitters. Nation **required**.
- **`Bevanda`**: Water, soft drinks, coffee. Nation **optional** (generic items like Water or Coffee have no origin).

### Configuration & Locations
- **`Allergene`**: Centralized allergen management.
- **`Nazione`, `Regione`, `Zona`**: Geographic data for product origins.
- **`Tipologie`**: Cross-cutting classifications.
- **`ServiziAccessorio`**: Extra services.

### System
- **`Users`**: RBAC (Admin/User).
- **`Media`**: Image uploads (GCS).

## 🌐 Singleton Collections

### `generali` — Single Source of Truth per Orari e Aperture

**File**: `src/collections/Generali.ts`  
**Slug**: `generali`  
**Tipo**: Collection (Singleton Pattern — massimo 1 documento)  
**Group**: `Ristorante configurazione` (prima voce del gruppo)  
**Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `create` bloccato se esiste già un documento / `delete` sempre bloccato

> **Perché Collection e non Global?** Payload v3 posiziona sempre i Globals *dopo* tutte le Collections nella sidebar. Usando il Singleton Pattern su una Collection, possiamo controllare liberamente l'ordine nel menu.

Questa collection è la fonte primaria di verità per tutto ciò che riguarda la gestione del tempo del ristorante. Il frontend deve consultare questa collection per determinare disponibilità e menu da mostrare.

#### Struttura Dati

**Tab 1: Orari Settimanali** — campo `scheduleWeekly` (Array, 7 righe fisse)

Ogni elemento rappresenta un giorno della settimana:

```typescript
{
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  isOpen: boolean,         // true = aperto, false = chiuso
  hours: Array<{
    start: string,         // Formato HH:MM (es. "12:00")
    end: string,           // Formato HH:MM (es. "15:00")
  }>
}
```

**Regola**: `hours` è visibile nell'admin solo se `isOpen === true`. Il frontend deve ignorare `hours` se `isOpen === false`.

---

**Tab 2: Fasce Pranzo / Cena** — campi `lunchSlot` e `dinnerSlot` (Group)

Definisce i range temporali per la logica di selezione menu del frontend:

```typescript
lunchSlot: {
  start: string,   // default "12:00"
  end: string,     // default "15:00"
}
dinnerSlot: {
  start: string,   // default "19:00"
  end: string,     // default "23:00"
}
```

**Logica Frontend**:
- Se `orarioCorrente >= lunchSlot.start && orarioCorrente <= lunchSlot.end` → mostra menu pranzo
- Se `orarioCorrente >= dinnerSlot.start && orarioCorrente <= dinnerSlot.end` → mostra menu cena
- Questi range sono **indipendenti** dagli orari di apertura (`scheduleWeekly`)

---

**Tab 3: Eccezioni & Festività** — campo `exceptions` (Array)

Ogni eccezione sovrascrive gli orari settimanali standard per una data specifica:

```typescript
{
  date: string,                              // ISO date (es. "2026-12-25T00:00:00.000Z")
  type: 'chiusura-totale' | 'orario-variato',
  reason?: string,                           // es. "Natale", "Ferie estive"
  variedHours?: Array<{                      // solo se type === 'orario-variato'
    start: string,
    end: string,
  }>
}
```

**Priorità**: Le eccezioni hanno sempre priorità sugli orari settimanali. Il frontend deve verificare prima se esiste un'eccezione per la data corrente prima di consultare `scheduleWeekly`.

#### Componente UI Personalizzato: `ImportaFestivitaButton`

**File**: `src/components/ImportaFestivitaButton.tsx`

Bottone React (`'use client'`) che appare in cima alla Tab "Eccezioni & Festività". Al click:
1. Carica dinamicamente la libreria `date-holidays`
2. Calcola le festività pubbliche italiane dell'anno corrente
3. Filtra le date già presenti in `exceptions` (no duplicati)
4. Popola l'array `exceptions` tramite `useField({ path: 'exceptions' })`
5. Mostra feedback visivo (successo/errore)

**Dipendenza**: `date-holidays` (npm package, installato come dipendenza del progetto)

#### Algoritmo di Risoluzione Orari (per il Frontend)

```
1. Ottieni data/ora corrente
2. Cerca in `exceptions` una entry con `date` == oggi
   a. Se trovata e `type === 'chiusura-totale'` → ristorante CHIUSO
   b. Se trovata e `type === 'orario-variato'` → usa `variedHours`
3. Se nessuna eccezione, cerca in `scheduleWeekly` il giorno della settimana corrente
   a. Se `isOpen === false` → ristorante CHIUSO
   b. Se `isOpen === true` → usa `hours`
4. Determina fascia attiva (pranzo/cena) confrontando ora corrente con `lunchSlot`/`dinnerSlot`
```

#### API REST

```bash
# Lettura del documento singleton (id=1)
GET /api/generali/1

# Lista (restituisce sempre al massimo 1 documento)
GET /api/generali

# Aggiornamento (solo admin)
PATCH /api/generali/1
```

#### Singleton Pattern — Regole per gli agenti AI

- **Non creare mai un secondo documento** `generali`. L'`access.create` lo blocca a runtime, ma è bene saperlo.
- **Per leggere i dati** dal frontend, usare sempre `GET /api/generali?limit=1` e prendere `docs[0]`.
- **Non eliminare** il documento: `access.delete` è sempre `false`.

#### Nota sull'ordinamento Sidebar

Il gruppo `"Ristorante configurazione"` appare nella sidebar nell'ordine in cui le collections sono dichiarate in `payload.config.ts`. `Generali` è la prima collection del gruppo, quindi appare per prima. Questo è il motivo per cui è una Collection e non un Global.

## 🧠 Key Logic Patterns

### Smart Webhook (Traffic Cop)
Located in `src/hooks/smartWebhook.ts`.
- **Fast Path**: Regenerates JSON on GCS for simple availability toggles.
- **Slow Path**: Triggers full rebuilds via Pub/Sub for structural changes.
- **Mock Mode**: Simulates GCP in local dev.

### Collection Factory: `createBevandaCollection`

Located in `src/collections/factories/createBevandaCollection.ts`.

All beverage-type collections (`Vino`, `Birra`, `Liquore`, `Cocktail`, `Bevanda`) are generated by this single factory. It accepts an options object with:

- **`nazioneOptional?: boolean`** — when `true`, the `nazione` (nation) relationship field is not required. Defaults to `false` (required).

**Rule**: Only `Cocktail` and `Bevanda` pass `nazioneOptional: true`. `Vino`, `Birra`, and `Liquore` must always have a nation.

```typescript
// ✅ Nation optional (Bevanda, Cocktail)
createBevandaCollection({ slug: 'bevande', ..., nazioneOptional: true })

// ✅ Nation required (Vino, Birra, Liquore — default)
createBevandaCollection({ slug: 'vini', ... })
```

### Import Map & Conditional Plugins
**CRITICAL**: When regenerating import maps (`pnpm generate:importmap`), ensure `GCS_BUCKET` is handled correctly to avoid "PayloadComponent not found" errors in production. See `docs/dev/TROUBLESHOOTING.md`.

### GCS Media Storage (CRITICAL)
The `Media` collection uses Google Cloud Storage in production. There are **two independent but both required** configurations:

**1. Plugin in `payload.config.ts`** (handles upload routing to GCS):
```typescript
const gcsPlugin = gcsStorage({
  collections: { media: true },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  options: { projectId: process.env.GCP_PROJECT_ID },
  enabled: Boolean(process.env.GCS_BUCKET), // runtime toggle
})
```

**2. `disableLocalStorage` inside the plugin config in `src/payload.config.ts`** (NOT in the collection):
```typescript
// ✅ CORRECT: evaluated at runtime by Node.js
media: gcsEnabled ? { disableLocalStorage: true } : true,

// ❌ WRONG: compiled into the bundle at build time (always false in Docker)
// upload: { disableLocalStorage: Boolean(process.env.GCS_BUCKET) }
```

**3. `afterRead` hook + `adminThumbnail` in `src/collections/Media.ts`** (absolute guarantee):
```typescript
upload: {
  adminThumbnail: ({ doc }) => {
    if (process.env.GCS_BUCKET && doc.filename)
      return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.filename}`
    return null
  },
},
hooks: {
  afterRead: [({ doc }) => {
    if (doc.filename && process.env.GCS_BUCKET)
      doc.url = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.filename}`
    return doc
  }],
},
```

**WHY ALL THREE ARE NEEDED**:
- `disableLocalStorage` in plugin config: prevents writing file to local disk on Cloud Run
- `afterRead` hook: overwrites `doc.url` at every read — works even if the plugin falls back to local URLs (e.g. with Uniform Bucket Level Access active on the bucket, which blocks per-file ACL and causes the plugin to silently fall back to local URLs)
- `adminThumbnail`: ensures Admin Panel previews load from GCS

**CRITICAL - Build-time vs Runtime trap**: `disableLocalStorage` in the collection's `upload` config is compiled into the Next.js bundle during `next build` in Docker (where `GCS_BUCKET` is undefined → `false`). In the plugin config it's evaluated at runtime by Node.js. Always put it in the plugin config.

**4. GCS Bucket configuration** (verified via Google Cloud Console GUI):

Three things must be set on the bucket (`Cloud Storage → Bucket → [name]`):

| Tab | Setting | Required value | Effect if wrong |
|---|---|---|---|
| Permissions | `allUsers` → `Storage Object Viewer` | Must exist | Every file URL returns `403 Forbidden` |
| Configuration | Access control | `Uniform` (standard) | With `Fine-grained`, plugin tries per-file ACL (deprecated) |
| Configuration | Public access prevention | `Not enforced` | If `Enforced`, blocks `allUsers` even if added → files never public |

**Verification**: At startup, check Cloud Run logs for:
```
[GCS Storage] GCS_BUCKET: <bucket-name>
[GCS Storage] Plugin abilitato: true
```
If you see `(non impostato)` or `false`, env vars are missing in Cloud Run service configuration.

**Root cause summary** (confirmed in production): The most common reason uploads go to `/api/media/file/` instead of GCS is a combination of:
1. `disableLocalStorage` placed in the collection instead of the plugin config (build-time vs runtime compilation)
2. Missing `allUsers:objectViewer` on the bucket (files reach GCS but URLs return 403)
3. `afterRead` hook missing (no fallback URL override when plugin fails silently with Uniform Bucket Level Access)

---

# Payload CMS Development Rules (General)

You are an expert Payload CMS developer. When working with Payload projects, follow these rules:

## Core Principles

1. **TypeScript-First**: Always use TypeScript with proper types from Payload
2. **Security-Critical**: Follow all security patterns, especially access control
3. **Type Generation**: Run `generate:types` script after schema changes
4. **Transaction Safety**: Always pass `req` to nested operations in hooks
5. **Access Control**: Understand Local API bypasses access control by default
6. **Access Control**: Ensure roles exist when modifiyng collection or globals with access controls

### Code Validation

- To validate typescript correctness after modifying code run `tsc --noEmit`
- Generate import maps after creating or modifying components.

### Import Map with Conditional Plugins

**CRITICAL**: This project uses `@payloadcms/storage-gcs` which is conditionally enabled via `GCS_BUCKET` env var. When regenerating the importMap, you MUST simulate production environment:

```bash
GCS_BUCKET=dummy GCP_PROJECT_ID=dummy npx payload generate:importmap
```

If you forget this, production will show a blank admin page with error:
`getFromImportMap: PayloadComponent not found in importMap`

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # Collection configs
├── globals/                 # Global configs
├── components/              # Custom React components
├── hooks/                   # Hook functions
├── access/                  # Access control functions
└── payload.config.ts        # Main config
```

## Configuration

### Minimal Config Pattern

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
})
```

## Collections

### Basic Collection

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

### Auth Collection with RBAC

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // Include in JWT for fast access checks
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('admin'),
      },
    },
  ],
}
```

## Fields

### Common Patterns

```typescript
// Auto-generate slugs
import { slugField } from 'payload'
slugField({ fieldToUse: 'title' })

// Relationship with filtering
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  filterOptions: { active: { equals: true } },
}

// Conditional field
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (data) => data.featured === true,
  },
}

// Virtual field
{
  name: 'fullName',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [({ siblingData }) => `${siblingData.firstName} ${siblingData.lastName}`],
  },
}
```

## CRITICAL SECURITY PATTERNS

### 1. Local API Access Control (MOST IMPORTANT)

```typescript
// ❌ SECURITY BUG: Access control bypassed
await payload.find({
  collection: 'posts',
  user: someUser, // Ignored! Operation runs with ADMIN privileges
})

// ✅ SECURE: Enforces user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUIRED
})

// ✅ Administrative operation (intentional bypass)
await payload.find({
  collection: 'posts',
  // No user, overrideAccess defaults to true
})
```

**Rule**: When passing `user` to Local API, ALWAYS set `overrideAccess: false`

### 2. Transaction Safety in Hooks

```typescript
// ❌ DATA CORRUPTION RISK: Separate transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Missing req - runs in separate transaction!
      })
    },
  ],
}

// ✅ ATOMIC: Same transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Maintains atomicity
      })
    },
  ],
}
```

**Rule**: ALWAYS pass `req` to nested operations in hooks

### 3. Prevent Infinite Hook Loops

```typescript
// ❌ INFINITE LOOP
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }) // Triggers afterChange again!
    },
  ],
}

// ✅ SAFE: Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return

      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## Access Control

### Collection-Level Access

```typescript
import type { Access } from 'payload'

// Boolean return
const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Query constraint (row-level security)
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.roles?.includes('admin')) return true

  return {
    author: { equals: user.id },
  }
}

// Async access check
const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true

  const project = await payload.findByID({
    collection: 'projects',
    id: id as string,
    depth: 0,
  })

  return project.members?.includes(user.id)
}
```

### Field-Level Access

```typescript
// Field access ONLY returns boolean (no query constraints)
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => {
      // Self can read own salary
      if (user?.id === doc?.id) return true
      // Admin can read all
      return user?.roles?.includes('admin')
    },
    update: ({ req: { user } }) => {
      // Only admins can update
      return user?.roles?.includes('admin')
    },
  },
}
```

### Common Access Patterns

```typescript
// Anyone
export const anyone: Access = () => true

// Authenticated only
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Admin only
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.roles?.includes('admin')
}

// Admin or self
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { id: { equals: user?.id } }
}

// Published or authenticated
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

## Hooks

### Common Hook Patterns

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // Before validation - format data
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],

    // Before save - business logic
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'update' && data.status === 'published') {
          data.publishedAt = new Date()
        }
        return data
      },
    ],

    // After save - side effects
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // Check context to prevent loops
        if (context.skipNotification) return

        if (operation === 'create') {
          await sendNotification(doc)
        }
        return doc
      },
    ],

    // After read - computed fields
    afterRead: [
      async ({ doc, req }) => {
        doc.viewCount = await getViewCount(doc.id)
        return doc
      },
    ],

    // Before delete - cascading deletes
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({
          collection: 'comments',
          where: { post: { equals: id } },
          req, // Important for transaction
        })
      },
    ],
  },
}
```

### 4. Traffic Cop Pattern (Smart Webhooks)

Use this pattern to intelligently handle document updates based on what changed:

```typescript
// src/hooks/smartWebhook.ts
function detectChangeType(doc, previousDoc) {
  // Fast Path: Only availability changed
  if (doc.inLista !== previousDoc.inLista) {
    return 'fast-path' // e.g., regenerate JSON
  }

  // Slow Path: Content changed
  if (doc.title !== previousDoc.title || doc.price !== previousDoc.price) {
    return 'slow-path' // e.g., trigger full rebuild
  }

  return 'none'
}

// In collection hook
afterChange: [
  async ({ doc, previousDoc, req }) => {
    const changeType = detectChangeType(doc, previousDoc)
    
    if (changeType === 'fast-path') {
      await regenerateJson(req)
    } else if (changeType === 'slow-path') {
      await triggerBuild(req)
    }
  }
]
```

## Queries

### Local API

```typescript
// Find with complex query
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [{ status: { equals: 'published' } }, { 'author.name': { contains: 'john' } }],
  },
  depth: 2, // Populate relationships
  limit: 10,
  sort: '-createdAt',
  select: {
    title: true,
    author: true,
  },
})

// Find by ID
const post = await payload.findByID({
  collection: 'posts',
  id: '123',
  depth: 2,
})

// Create
const newPost = await payload.create({
  collection: 'posts',
  data: {
    title: 'New Post',
    status: 'draft',
  },
})

// Update
await payload.update({
  collection: 'posts',
  id: '123',
  data: { status: 'published' },
})

// Delete
await payload.delete({
  collection: 'posts',
  id: '123',
})
```

### Query Operators

```typescript
// Equals
{ status: { equals: 'published' } }

// Not equals
{ status: { not_equals: 'draft' } }

// Greater than / less than
{ price: { greater_than: 100 } }
{ age: { less_than_equal: 65 } }

// Contains (case-insensitive)
{ title: { contains: 'payload' } }

// Like (all words present)
{ description: { like: 'cms headless' } }

// In array
{ category: { in: ['tech', 'news'] } }

// Exists
{ image: { exists: true } }

// Near (geospatial)
{ location: { near: [-122.4194, 37.7749, 10000] } }
```

### AND/OR Logic

```typescript
{
  or: [
    { status: { equals: 'published' } },
    { author: { equals: user.id } },
  ],
}

{
  and: [
    { status: { equals: 'published' } },
    { featured: { equals: true } },
  ],
}
```

## Getting Payload Instance

```typescript
// In API routes (Next.js)
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
  })

  return Response.json(posts)
}

// In Server Components
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'posts' })

  return <div>{docs.map(post => <h1 key={post.id}>{post.title}</h1>)}</div>
}
```

## Components

The Admin Panel can be extensively customized using React Components. Custom Components can be Server Components (default) or Client Components.

### Defining Components

Components are defined using **file paths** (not direct imports) in your config:

**Component Path Rules:**

- Paths are relative to project root or `config.admin.importMap.baseDir`
- Named exports: use `#ExportName` suffix or `exportName` property
- Default exports: no suffix needed
- File extensions can be omitted

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      // Logo and branding
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },

      // Navigation
      Nav: '/components/CustomNav',
      beforeNavLinks: ['/components/CustomNavItem'],
      afterNavLinks: ['/components/NavFooter'],

      // Header
      header: ['/components/AnnouncementBanner'],
      actions: ['/components/ClearCache', '/components/Preview'],

      // Dashboard
      beforeDashboard: ['/components/WelcomeMessage'],
      afterDashboard: ['/components/Analytics'],

      // Auth
      beforeLogin: ['/components/SSOButtons'],
      logout: { Button: '/components/LogoutButton' },

      // Settings
      settingsMenu: ['/components/SettingsMenu'],

      // Views
      views: {
        dashboard: { Component: '/components/CustomDashboard' },
      },
    },
  },
})
```

**Component Path Rules:**

- Paths are relative to project root or `config.admin.importMap.baseDir`
- Named exports: use `#ExportName` suffix or `exportName` property
- Default exports: no suffix needed
- File extensions can be omitted

### Component Types

1. **Root Components** - Global Admin Panel (logo, nav, header)
2. **Collection Components** - Collection-specific (edit view, list view)
3. **Global Components** - Global document views
4. **Field Components** - Custom field UI and cells

### Component Types

1. **Root Components** - Global Admin Panel (logo, nav, header)
2. **Collection Components** - Collection-specific (edit view, list view)
3. **Global Components** - Global document views
4. **Field Components** - Custom field UI and cells

### Server vs Client Components

**All components are Server Components by default** (can use Local API directly):

```tsx
// Server Component (default)
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const posts = await payload.find({ collection: 'posts' })
  return <div>{posts.totalDocs} posts</div>
}

export default MyServerComponent
```

**Client Components** need the `'use client'` directive:

```tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  return (
    <button onClick={() => setCount(count + 1)}>
      {user?.email}: Clicked {count} times
    </button>
  )
}
```

### Using Hooks (Client Components Only)

```tsx
'use client'
import {
  useAuth, // Current user
  useConfig, // Payload config (client-safe)
  useDocumentInfo, // Document info (id, collection, etc.)
  useField, // Field value and setter
  useForm, // Form state
  useFormFields, // Multiple field values (optimized)
  useLocale, // Current locale
  useTranslation, // i18n translations
  usePayload, // Local API methods
} from '@payloadcms/ui'

export function MyComponent() {
  const { user } = useAuth()
  const { config } = useConfig()
  const { id, collection } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  return <div>Hello {user?.email}</div>
}
```

### Collection/Global Components

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      // Edit view
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
        SaveDraftButton: '/components/SaveDraft',
        PublishButton: '/components/Publish',
      },

      // List view
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/BulkActions'],
        afterList: ['/components/ListFooter'],
      },
    },
  },
}
```

### Field Components

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      // Edit view field
      Field: '/components/StatusField',
      // List view cell
      Cell: '/components/StatusCell',
      // Field label
      Label: '/components/StatusLabel',
      // Field description
      Description: '/components/StatusDescription',
      // Error message
      Error: '/components/StatusError',
    },
  },
}
```

**UI Field** (presentational only, no data):

```typescript
{
  name: 'refundButton',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/RefundButton',
    },
  },
}
```

### Performance Best Practices

1. **Import correctly:**

   - Admin Panel: `import { Button } from '@payloadcms/ui'`
   - Frontend: `import { Button } from '@payloadcms/ui/elements/Button'`

2. **Optimize re-renders:**

   ```tsx
   // ❌ BAD: Re-renders on every form change
   const { fields } = useForm()

   // ✅ GOOD: Only re-renders when specific field changes
   const value = useFormFields(([fields]) => fields[path])
   ```

3. **Prefer Server Components** - Only use Client Components when you need:

   - State (useState, useReducer)
   - Effects (useEffect)
   - Event handlers (onClick, onChange)
   - Browser APIs (localStorage, window)

4. **Minimize serialized props** - Server Components serialize props sent to client

### Styling Components

```tsx
import './styles.scss'

export function MyComponent() {
  return <div className="my-component">Content</div>
}
```

```scss
// Use Payload's CSS variables
.my-component {
  background-color: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
  border-radius: var(--border-radius-m);
}

// Import Payload's SCSS library
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

### Type Safety

```tsx
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
  SelectFieldServerComponent,
  // ... etc
} from 'payload'

export const MyField: TextFieldClientComponent = (props) => {
  // Fully typed props
}
```

### Import Map

Payload auto-generates `app/(payload)/admin/importMap.js` to resolve component paths.

**Regenerate manually:**

```bash
payload generate:importmap
```

**Set custom location:**

```typescript
export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(dirname, 'app', 'custom-import-map.js'),
    },
  },
})
```

## Custom Endpoints

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

// Always check authentication
export const protectedEndpoint: Endpoint = {
  path: '/protected',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    // Use req.payload for database operations
    const data = await req.payload.find({
      collection: 'posts',
      where: { author: { equals: req.user.id } },
    })

    return Response.json(data)
  },
}

// Route parameters
export const trackingEndpoint: Endpoint = {
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    const { id } = req.routeParams

    const tracking = await getTrackingInfo(id)

    if (!tracking) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }

    return Response.json(tracking)
  },
}
```

## Drafts & Versions

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 100,
  },
  access: {
    read: ({ req: { user } }) => {
      // Public sees only published
      if (!user) return { _status: { equals: 'published' } }
      // Authenticated sees all
      return true
    },
  },
}

// Create draft
await payload.create({
  collection: 'pages',
  data: { title: 'Draft Page' },
  draft: true, // Skips required field validation
})

// Read with drafts
const page = await payload.findByID({
  collection: 'pages',
  id: '123',
  draft: true, // Returns draft if available
})
```

## Field Type Guards

```typescript
import {
  fieldAffectsData,
  fieldHasSubFields,
  fieldIsArrayType,
  fieldIsBlockType,
  fieldSupportsMany,
  fieldHasMaxDepth,
} from 'payload'

function processField(field: Field) {
  // Check if field stores data
  if (fieldAffectsData(field)) {
    console.log(field.name) // Safe to access
  }

  // Check if field has nested fields
  if (fieldHasSubFields(field)) {
    field.fields.forEach(processField) // Safe to access
  }

  // Check field type
  if (fieldIsArrayType(field)) {
    console.log(field.minRows, field.maxRows)
  }

  // Check capabilities
  if (fieldSupportsMany(field) && field.hasMany) {
    console.log('Multiple values supported')
  }
}
```

## Plugins

### Using Plugins

```typescript
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

export default buildConfig({
  plugins: [
    seoPlugin({
      collections: ['posts', 'pages'],
    }),
    redirectsPlugin({
      collections: ['pages'],
    }),
  ],
})
```

### Creating Plugins

```typescript
import type { Config, Plugin } from 'payload'

interface MyPluginConfig {
  collections?: string[]
  enabled?: boolean
}

export const myPlugin =
  (options: MyPluginConfig): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (options.collections?.includes(collection.slug)) {
        return {
          ...collection,
          fields: [...collection.fields, { name: 'pluginField', type: 'text' }],
        }
      }
      return collection
    }),
  })
```

## Best Practices

### Security

1. Always set `overrideAccess: false` when passing `user` to Local API
2. Field-level access only returns boolean (no query constraints)
3. Default to restrictive access, gradually add permissions
4. Never trust client-provided data
5. Use `saveToJWT: true` for roles to avoid database lookups

### Performance

1. Index frequently queried fields
2. Use `select` to limit returned fields
3. Set `maxDepth` on relationships to prevent over-fetching
4. Use query constraints over async operations in access control
5. Cache expensive operations in `req.context`

### Data Integrity

1. Always pass `req` to nested operations in hooks
2. Use context flags to prevent infinite hook loops
3. Enable transactions for MongoDB (requires replica set) and Postgres
4. Use `beforeValidate` for data formatting
5. Use `beforeChange` for business logic

### Type Safety

1. Run `generate:types` after schema changes
2. Import types from generated `payload-types.ts`
3. Type your user object: `import type { User } from '@/payload-types'`
4. Use `as const` for field options
5. Use field type guards for runtime type checking

### Organization

1. Keep collections in separate files
2. Extract access control to `access/` directory
3. Extract hooks to `hooks/` directory
4. Use reusable field factories for common patterns
5. Document complex access control with comments

## Common Gotchas

1. **Local API Default**: Access control bypassed unless `overrideAccess: false`
2. **Transaction Safety**: Missing `req` in nested operations breaks atomicity
3. **Hook Loops**: Operations in hooks can trigger the same hooks
4. **Field Access**: Cannot use query constraints, only boolean
5. **Relationship Depth**: Default depth is 2, set to 0 for IDs only
6. **Draft Status**: `_status` field auto-injected when drafts enabled
7. **Type Generation**: Types not updated until `generate:types` runs
8. **MongoDB Transactions**: Require replica set configuration
9. **SQLite Transactions**: Disabled by default, enable with `transactionOptions: {}`
10. **Point Fields**: Not supported in SQLite
11. **Conditional spread in `payload.create` data**: `...(condition && { field: value })` produces type `{ field: T } | false`, which breaks TypeScript overload resolution for collections with drafts enabled. Always use `field: value ?? undefined` for optional fields instead.

## Additional Context Files

For deeper exploration of specific topics, refer to the context files located in `.cursor/rules/`:

### Available Context Files

1. **`payload-overview.md`** - High-level architecture and core concepts

   - Payload structure and initialization
   - Configuration fundamentals
   - Database adapters overview

2. **`security-critical.md`** - Critical security patterns (⚠️ IMPORTANT)

   - Local API access control
   - Transaction safety in hooks
   - Preventing infinite hook loops

3. **`collections.md`** - Collection configurations

   - Basic collection patterns
   - Auth collections with RBAC
   - Upload collections
   - Drafts and versioning
   - Globals

4. **`fields.md`** - Field types and patterns

   - All field types with examples
   - Conditional fields
   - Virtual fields
   - Field validation
   - Common field patterns

5. **`field-type-guards.md`** - TypeScript field type utilities

   - Field type checking utilities
   - Safe type narrowing
   - Runtime field validation

6. **`access-control.md`** - Permission patterns

   - Collection-level access
   - Field-level access
   - Row-level security
   - RBAC patterns
   - Multi-tenant access control

7. **`access-control-advanced.md`** - Complex access patterns

   - Nested document access
   - Cross-collection permissions
   - Dynamic role hierarchies
   - Performance optimization

8. **`hooks.md`** - Lifecycle hooks

   - Collection hooks
   - Field hooks
   - Hook context patterns
   - Common hook recipes

9. **`queries.md`** - Database operations

   - Local API usage
   - Query operators
   - Complex queries with AND/OR
   - Performance optimization

10. **`endpoints.md`** - Custom API endpoints

    - REST endpoint patterns
    - Authentication in endpoints
    - Error handling
    - Route parameters

11. **`adapters.md`** - Database and storage adapters

    - MongoDB, PostgreSQL, SQLite patterns
    - Storage adapter usage (S3, Azure, GCS, etc.)
    - Custom adapter development

12. **`plugin-development.md`** - Creating plugins

    - Plugin architecture
    - Modifying configuration
    - Plugin hooks
    - Best practices

13. **`components.md`** - Custom Components

    - Component types (Root, Collection, Global, Field)
    - Server vs Client Components
    - Component paths and definition
    - Default and custom props
    - Using hooks
    - Performance best practices
    - Styling components

## Resources

- Docs: https://payloadcms.com/docs
- LLM Context: https://payloadcms.com/llms-full.txt
- GitHub: https://github.com/payloadcms/payload
- Examples: https://github.com/payloadcms/payload/tree/main/examples
- Templates: https://github.com/payloadcms/payload/tree/main/templates
