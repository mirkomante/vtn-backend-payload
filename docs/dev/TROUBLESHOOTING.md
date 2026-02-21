# Troubleshooting Guide

Questa guida contiene soluzioni dettagliate ai problemi tecnici più comuni del progetto.

## 📋 Indice

- [Admin Panel Bianco su Cloud Run](#admin-panel-bianco-su-cloud-run)
- [Errori ImportMap](#errori-importmap)
- [Problemi UI e Styling](#problemi-ui-e-styling)
- [Errori TypeScript](#errori-typescript)
- [Problemi di Autenticazione](#problemi-di-autenticazione)
- [Errori Database](#errori-database)
- [Problemi Storage e Media](#problemi-storage-e-media)

---

## Admin Panel Bianco su Cloud Run

### 🔴 Problema

L'admin panel (`/admin`) funziona perfettamente in locale ma mostra una **pagina bianca** su Cloud Run.

### 🔍 Diagnosi

**Log di Cloud Run**:
```
ERROR: getFromImportMap: PayloadComponent not found in importMap {
  key: '@payloadcms/storage-gcs/client#GcsClientUploadHandler'
}
```

### 🧠 Causa Tecnica

Il problema è causato dalla **discrepanza tra build-time e runtime** per i plugin condizionali:

1. **Durante `docker build` (locale o CI/CD senza env vars)**:
   ```typescript
   // ❌ SBAGLIATO
   const gcsPlugin = process.env.GCS_BUCKET
     ? [gcsStorage({ ... })]
     : []  // ← Plugin completamente escluso
   
   plugins: [...gcsPlugin]
   ```
   
   - `GCS_BUCKET` **non è definito** durante il build Docker
   - Array vuoto `[]` viene inserito nei plugin
   - Il plugin non viene mai inizializzato
   - `initClientUploads()` non viene mai chiamato
   - Il componente `GcsClientUploadHandler` **non entra nell'importMap**
   - `next build` genera `importMap.js` **senza** il componente
   - L'importMap viene **compilata nel bundle** (immutabile)

2. **A runtime su Cloud Run (con env vars)**:
   ```env
   GCS_BUCKET=my-bucket
   GCP_PROJECT_ID=my-project
   ```
   
   - `process.env.GCS_BUCKET` **è definito**
   - Payload valuta la condizione: plugin attivo
   - Il plugin registra i suoi componenti nella configurazione
   - Payload cerca `GcsClientUploadHandler` nell'importMap pre-generata
   - **Componente non trovato** → pagina bianca

### ✅ Soluzione

**Usa sempre l'opzione `enabled` invece di esclusione condizionale**:

```typescript
// ✅ CORRETTO
const gcsPlugin = gcsStorage({
  collections: {
    media: true,
  },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  options: {
    projectId: process.env.GCP_PROJECT_ID,
  },
  enabled: Boolean(process.env.GCS_BUCKET),  // ← Controlla funzionalità, NON registrazione
})

export default buildConfig({
  plugins: [
    gcsPlugin,  // ← Sempre presente, anche se disabilitato
    // ...altri plugin
  ],
})
```

**Perché funziona**:
- Il plugin viene **sempre incluso** nella configurazione
- `initClientUploads()` viene **sempre chiamato** (anche con `enabled: false`)
- I componenti client vengono **sempre registrati** nell'importMap
- Con `enabled: false`: plugin presente ma inattivo (non modifica collections, non aggiunge endpoint)
- Con `enabled: true`: plugin completamente funzionante
- L'importMap contiene i componenti in **entrambi i casi**

### 🛠️ Fix Completo

**File**: `src/payload.config.ts`

```typescript
import { gcsStorage } from '@payloadcms/storage-gcs'

// GCS Storage Plugin - attivo solo in produzione quando GCS_BUCKET è configurato
// In locale i media vengono salvati nella cartella /media del progetto
// Il plugin è SEMPRE incluso nella config (con enabled condizionale) per garantire
// che il componente GcsClientUploadHandler sia sempre presente nell'importMap,
// evitando pagine bianche in produzione.
const gcsPlugin = gcsStorage({
  collections: {
    media: true,
  },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  options: {
    projectId: process.env.GCP_PROJECT_ID,
  },
  enabled: Boolean(process.env.GCS_BUCKET),
})

export default buildConfig({
  // ...
  plugins: [
    gcsPlugin,  // Cambiato da: ...gcsPlugin (spread condizionale)
    cancelButtonPlugin(),
    // ...
  ],
})
```

### 📝 Checklist

- [ ] Plugin sempre incluso (no spread condizionale)
- [ ] Opzione `enabled` usata per controllo runtime
- [ ] Valore dummy per parametri richiesti (`bucket: 'not-configured'`)
- [ ] Rigenera importMap: `npx payload generate:importmap`
- [ ] Verifica che `importMap.js` contenga il componente
- [ ] Commit e push
- [ ] Verifica deploy su Cloud Run

### 🔎 Verifica ImportMap

**File**: `src/app/(payload)/admin/importMap.js`

Controlla che contenga:

```javascript
import { GcsClientUploadHandler as GcsClientUploadHandler_06e62ca02c7c441053a9b643e5545934 } from '@payloadcms/storage-gcs/client'

export const importMap = {
  // ...
  "@payloadcms/storage-gcs/client#GcsClientUploadHandler": GcsClientUploadHandler_06e62ca02c7c441053a9b643e5545934,
  // ...
}
```

Se manca, rigenera con `npx payload generate:importmap`.

---

## Errori ImportMap

### Come Funziona l'ImportMap

L'`importMap.js` è un **file auto-generato** che mappa path stringa → componenti React:

```javascript
export const importMap = {
  "./components/LoginView.tsx#default": LoginView_abc123,
  "@payloadcms/storage-gcs/client#GcsClientUploadHandler": Handler_def456,
}
```

**Quando viene generato**:
- Durante `next build` (esplicito o automatico)
- Con comando manuale: `npx payload generate:importmap`

**Cosa registra**:
- Tutti i componenti custom definiti nella config
- Tutti i componenti client dei plugin **attivi durante la generazione**

### Quando Rigenerare

| Azione | Motivo | Comando |
|--------|--------|---------|
| Aggiungi componente custom | Nuovo componente da mappare | `npx payload generate:importmap` |
| Modifichi path componente | Path cambiato | `npx payload generate:importmap` |
| Aggiungi/rimuovi plugin | Nuovi componenti plugin | `npx payload generate:importmap` |
| Modifichi configurazione plugin | Possibili nuovi componenti | `npx payload generate:importmap` |

**Nota**: Con il pattern `enabled` corretto, non servono più env vars dummy.

### Debug ImportMap

**Problema**: Componente non trovato a runtime.

**Steps**:
1. Leggi l'errore nei log:
   ```
   getFromImportMap: PayloadComponent not found in importMap {
     key: '@payloadcms/some-plugin/client#SomeComponent'
   }
   ```

2. Cerca nel file `src/app/(payload)/admin/importMap.js`:
   ```bash
   grep -r "SomeComponent" src/app/(payload)/admin/importMap.js
   ```

3. Se non c'è:
   - Verifica che il plugin sia incluso (non spread condizionale)
   - Rigenera: `npx payload generate:importmap`
   - Commit e rideploya

4. Se c'è ma l'errore persiste:
   - Verifica che il componente sia esportato correttamente
   - Controlla la versione del plugin
   - Pulisci `.next` e rebuilda: `rm -rf .next && pnpm build`

---

## Problemi UI e Styling

### Scroll Verticale nella Pagina di Login

**🔴 Sintomo**: Pagina di login (`/admin`) ha scroll verticale indesiderato, bottone non centrato.

**🔍 Causa**: I wrapper generati da Payload hanno padding/margin di default:
- `section.login`
- `.template-minimal`
- `.template-minimal__wrap`

**✅ Soluzione**: Override CSS in `src/app/(payload)/custom.scss`:

```scss
// Fix per la pagina di login: rimuove scroll verticale e centra il contenuto
section.login,
.template-minimal,
.template-minimal__wrap {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 100vh !important;
  height: 100vh !important;
  overflow: hidden !important;
}
```

**Testing**:
```bash
pnpm dev
```

Apri `http://localhost:3000/admin` e verifica:
- [ ] Nessuno scroll verticale
- [ ] Bottone centrato verticalmente
- [ ] Funziona in light e dark mode

### Tailwind CSS non Funziona nell'Admin

**🔴 Sintomo**: Classi Tailwind non applicate nei componenti admin.

**🔍 Verifica**:
1. Check import in layout:
   ```typescript
   // src/app/(payload)/layout.tsx
   import './custom.scss'  // Deve essere presente
   ```

2. Check `custom.scss`:
   ```scss
   // src/app/(payload)/custom.scss
   @import '../../styles/payloadStyles.css';  // Deve essere prima riga
   ```

3. Check `payloadStyles.css`:
   ```css
   // src/styles/payloadStyles.css
   @layer theme, base, components, utilities;
   @import 'tailwindcss/theme.css' layer(theme);
   @import 'tailwindcss/utilities.css' layer(utilities);
   ```

4. Check `tailwind.config.ts` content paths:
   ```typescript
   export default {
     content: [
       './src/app/(payload)/**/*.{js,ts,jsx,tsx}',  // Admin panel
       './src/components/**/*.{js,ts,jsx,tsx}',     // Componenti custom
     ],
   }
   ```

5. Rebuilda:
   ```bash
   rm -rf .next
   pnpm build
   ```

### Conflitti CSS con Payload Core

**🔴 Sintomo**: Stili Tailwind sovrascrivono l'UI core di Payload.

**✅ Soluzione**: **Preflight disabilitato** in `payloadStyles.css`:

```css
/* SKIP preflight to avoid conflicts with Payload core styles */
/* @import 'tailwindcss/preflight.css' layer(base); */
```

Questo previene che Tailwind resetti gli stili base di Payload.

---

## Errori TypeScript

### Tipi Generati Non Aggiornati

**🔴 Sintomo**:
```
Property 'nuovoCampo' does not exist on type 'Post'
```

**✅ Soluzione**:
```bash
pnpm generate:types
```

Questo rigenera `src/payload-types.ts` dalle collection configs.

### Errori di Compilazione dopo Modifiche

**🔴 Sintomo**: Build fallisce con errori TypeScript.

**Steps**:
1. Rigenera tipi:
   ```bash
   pnpm generate:types
   ```

2. Verifica errori:
   ```bash
   npx tsc --noEmit
   ```

3. Se errori persistono:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm generate:types
   ```

---

## Problemi di Autenticazione

### Google OAuth Redirect Failed

**🔴 Sintomo**: Errore durante il redirect OAuth dopo login Google.

**🔍 Verifica**:
1. **Variabili d'ambiente**:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
   ```

2. **Redirect URI in Google Cloud Console**:
   
   Vai su: https://console.cloud.google.com/apis/credentials
   
   Authorized redirect URIs deve includere:
   - Locale: `http://localhost:3000/api/users/oauth/google/callback`
   - Produzione: `https://your-domain.com/api/users/oauth/google/callback`

3. **Verifica endpoint**:
   ```bash
   curl http://localhost:3000/api/users/oauth/google/authorize
   ```
   
   Deve reindirizzare a Google OAuth.

### Utente Non Autorizzato

**🔴 Sintomo**: Login riuscito ma "Unauthorized" nell'admin.

**🔍 Causa**: Dominio email non autorizzato o ruoli mancanti.

**✅ Soluzione**:

1. Verifica config OAuth in `payload.config.ts`:
   ```typescript
   oAuthPlugin({
     databaseUri: process.env.DATABASE_URL || '',
     clientId: process.env.GOOGLE_CLIENT_ID || '',
     clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
     authCollection: 'users',
     serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
   })
   ```

2. Controlla la collection Users:
   ```typescript
   // src/collections/Users.ts
   access: {
     admin: ({ req: { user } }) => user?.roles?.includes('admin'),
   }
   ```

3. Aggiungi ruolo admin al primo utente manualmente nel database.

---

## Errori Database

### Connection Refused

**🔴 Sintomo**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**🔍 Causa**: PostgreSQL non raggiungibile.

**✅ Soluzione**:

**Locale**:
```bash
# Verifica che PostgreSQL sia in esecuzione
psql -U postgres -c "SELECT version();"

# Avvia se necessario (macOS con Homebrew)
brew services start postgresql@17
```

**Cloud SQL con Proxy**:
```bash
# Scarica proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.12.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Avvia proxy
./cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME
```

**Docker Compose**:
```bash
docker-compose up -d postgres
```

### Migration Failed

**🔴 Sintomo**:
```
Error: Migration xyz failed to execute
```

**✅ Soluzione**:

1. Verifica stato migrazioni:
   ```bash
   pnpm payload migrate:status
   ```

2. Rollback ultima migrazione (se necessario):
   ```bash
   pnpm payload migrate:down
   ```

3. Riapplica:
   ```bash
   pnpm payload migrate
   ```

4. Se errore persiste, verifica manualmente il SQL generato in `src/migrations/`.

---

## Problemi Storage e Media

### Upload Salva in Locale invece che su GCS

**🔴 Sintomo**: Upload funziona ma Payload restituisce URL locale (`/api/media/file/nome-file.jpg`) invece dell'URL pubblico GCS (`https://storage.googleapis.com/...`).

**🔍 Causa Principale**: `disableLocalStorage: true` mancante nella collection `Media`.

Anche quando il plugin GCS è attivo e funzionante, Payload mantiene il comportamento di storage locale **a meno che non venga esplicitamente disabilitato** nella collection. Senza questo flag:
- Il file viene salvato sia localmente che su GCS (doppio upload)
- L'URL restituito è quello locale, non quello GCS
- In produzione su Cloud Run (filesystem effimero), il file locale viene perso al riavvio del container

**✅ Soluzione**: Aggiungere `disableLocalStorage` alla collection `Media`:

```typescript
// src/collections/Media.ts
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
  ],
  upload: {
    // CRITICO: disabilita storage locale quando GCS è attivo.
    // Senza questo, l'URL restituito è /api/media/file/... invece di https://storage.googleapis.com/...
    disableLocalStorage: Boolean(process.env.GCS_BUCKET),
  },
}
```

**Perché `Boolean(process.env.GCS_BUCKET)` e non `true` fisso**:
- In locale (senza `GCS_BUCKET`), lo storage locale rimane attivo per lo sviluppo
- In produzione (con `GCS_BUCKET` impostato), lo storage locale viene disabilitato
- Questo garantisce che lo stesso codice funzioni in entrambi gli ambienti

### Upload Fails in Produzione

**🔴 Sintomo**: Upload media funziona in locale ma fallisce su Cloud Run.

**🔍 Causa**: Plugin GCS non configurato o permessi mancanti.

**✅ Soluzione**:

1. **Verifica env vars su Cloud Run**:
   ```env
   GCS_BUCKET=your-bucket-name
   GCP_PROJECT_ID=your-project-id
   ```

2. **Verifica permessi IAM**:
   - Service account Cloud Run deve avere ruolo `Storage Object Admin` sul bucket

3. **Verifica bucket pubblico** (se necessario):
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-bucket-name
   ```

4. **Verifica log all'avvio**: Cerca nei log di Cloud Run le righe di debug:
   ```
   [GCS Storage] GCS_BUCKET: your-bucket-name
   [GCS Storage] GCP_PROJECT_ID: your-project-id
   [GCS Storage] Plugin abilitato: true
   ```
   Se vedi `(non impostato)` o `false`, le env vars non sono configurate correttamente.

5. **Test upload**:
   - Prova upload da admin panel
   - Controlla log Cloud Run per errori specifici

### Checklist Completa Configurazione GCS

Usa questa checklist per verificare che tutto sia configurato correttamente:

**`src/payload.config.ts`**:
- [ ] Plugin `gcsStorage` sempre incluso (non in spread condizionale)
- [ ] `enabled: Boolean(process.env.GCS_BUCKET)` per controllo runtime
- [ ] `bucket: process.env.GCS_BUCKET || 'not-configured'` (valore dummy per build)
- [ ] Log di debug presenti per verificare le env vars

**`src/collections/Media.ts`**:
- [ ] `upload: { disableLocalStorage: Boolean(process.env.GCS_BUCKET) }` presente

**Cloud Run**:
- [ ] `GCS_BUCKET` impostato nelle env vars del servizio
- [ ] `GCP_PROJECT_ID` impostato nelle env vars del servizio
- [ ] Service Account ha ruolo `Storage Object Admin` sul bucket

**Bucket GCS**:
- [ ] Bucket esiste e ha accesso pubblico (se necessario)
- [ ] CORS configurato (se le immagini vengono caricate da browser)

**Build/Deploy**:
- [ ] `importMap.js` contiene `GcsClientUploadHandler` (vedi sezione Admin Panel Bianco)

### Media Non Accessibili

**🔴 Sintomo**: Immagini caricate ma URL non funziona (404).

**🔍 Verifica**:

1. **URL generato**:
   ```
   https://your-domain.com/media/filename.jpg  ← Locale (GCS non attivo)
   https://storage.googleapis.com/your-bucket/filename.jpg  ← GCS (corretto)
   ```
   Se vedi URL locale in produzione, il problema è `disableLocalStorage` mancante (vedi sopra).

2. **Bucket CORS** (se serve da browser):
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   
   Applica:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name
   ```

---

## 🆘 Debug Workflow Generale

Per qualsiasi problema:

1. **Leggi i log**:
   ```bash
   # Cloud Run
   gcloud logging read "resource.type=cloud_run_revision" --limit 50
   
   # Locale
   pnpm dev  # Leggi output console
   ```

2. **Isola il problema**:
   - Funziona in locale? → Problema di deploy/configurazione
   - Funziona in produzione ma non in locale? → Problema di env vars

3. **Verifica TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

4. **Pulisci e rebuilda**:
   ```bash
   rm -rf .next node_modules
   pnpm install
   pnpm build
   ```

5. **Consulta questa guida** per problemi noti.

---

## 📚 Risorse Aggiuntive

- **Documentazione Payload**: https://payloadcms.com/docs
- **Payload Discord**: https://discord.com/invite/payload
- **Documentazione progetto**: `README.md`, `AGENTS.md`, `TAILWIND_INTEGRATION.md`
- **Regole Cursor**: `.cursor/rules/` per pattern specifici
