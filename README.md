# Sistema di Gestione Menu Ristorante (Backend Payload CMS)

Questo progetto è un backend completo basato su **Payload CMS 3.0** e **Next.js 15**, progettato per la gestione di menu digitali, carte dei vini e configurazioni per ristoranti.

## 📚 Documentazione

**🔍 [Vai all'Indice Completo della Documentazione →](./DOCS_INDEX.md)**

| Documento | Descrizione |
|-----------|-------------|
| **[DOCS_INDEX.md](./DOCS_INDEX.md)** | 🎯 **Indice navigabile** di tutta la documentazione |
| **README.md** (questo file) | Panoramica del progetto, setup, deploy |
| **[API_REFERENCE.md](./API_REFERENCE.md)** | Documentazione completa API REST e GraphQL |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Guida risoluzione problemi tecnici |
| **[TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)** | Integrazione Tailwind CSS nell'admin panel |
| **[AGENTS.md](./AGENTS.md)** | Regole per sviluppo con Payload CMS |
| **[.cursor/rules/](./cursor/rules/)** | Context rules per Cursor AI |

## Funzionalità Principali

Il sistema è strutturato in diverse aree funzionali gestite tramite Collections di Payload:

### Gestione Menu
- **Piatti**: Gestione dettagliata dei piatti con descrizioni, prezzi e associazioni.
- **Menu Fissi**: Creazione di menu degustazione o fissi.
- **Categorie Piatti**: Organizzazione gerarchica delle portate.
- **Categorie Menu Fisso**: Tipologie di menu fissi.

### Gestione Cantina e Bevande
- **Vini**: Schede tecniche complete per vini (bianchi, rossi, rosati, bollicine).
- **Birre**: Gestione birre artigianali e industriali.
- **Cocktail**: Lista cocktail e ingredienti.
- **Liquori**: Gestione spirit e amari.
- **Bevande**: Acqua, bibite e caffetteria.

### Configurazioni e Impostazioni
- **Allergeni**: Gestione centralizzata degli allergeni per conformità normativa.
- **Zone, Nazioni, Regioni**: Gestione geografica per la provenienza dei prodotti.
- **Tipologie**: Classificazioni trasversali.
- **Servizi Accessori**: Gestione servizi extra.

### Utenti e Sicurezza
- **RBAC (Role-Based Access Control)**:
  - **Admin**: Accesso completo in lettura/scrittura su tutte le collezioni.
  - **User**: Accesso in sola lettura ai contenuti pubblicati.
- **Autenticazione**: Google OAuth 2.0 per l'accesso admin.

### Integrità Referenziale
Il sistema gestisce automaticamente la pulizia delle referenze quando i documenti vengono eliminati:

| Quando elimini... | Viene rimosso da... |
|-------------------|---------------------|
| Un **Piatto** | `menu-fisso.piatti` |
| Un **Servizio Accessorio** | `menu-fisso.servizi` |
| Un **Allergene** | `piatti.allergeni` |

Questo previene le "dangling references" (referenze orfane) nel database.

## Stack Tecnologico

- **Core**: [Payload CMS 3.74](https://payloadcms.com)
- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Storage**: Google Cloud Storage per i media
- **Hosting**: Google Cloud Run
- **CI/CD**: Cloud Build con GitHub connector
- **Language**: TypeScript

## Sviluppo Locale

### Prerequisiti
- Node.js v20 o superiore
- PostgreSQL 17 (locale o Cloud SQL Proxy)
- pnpm

### Installazione

1. **Clona il repository:**
   ```bash
   git clone <repository-url>
   cd vtn-backend-payload
   ```

2. **Configura le variabili d'ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Configura nel file `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/database
   PAYLOAD_SECRET=your-secret-key
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Installa le dipendenze:**
   ```bash
   pnpm install
   ```

4. **Avvia il server di sviluppo:**
   ```bash
   pnpm dev
   ```

5. **Accedi all'Admin Panel:**
   Apri [http://localhost:3000/admin](http://localhost:3000/admin)

### Connessione a Cloud SQL (opzionale)

Per sviluppare con il database di produzione:

1. Scarica [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy)

2. Autenticati:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. Avvia il proxy:
   ```bash
   ./cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME
   ```

4. Usa `localhost:5432` come host nel `DATABASE_URL`

## Migrazioni Database

Il progetto usa migrazioni esplicite per gestire lo schema del database in modo sicuro e deterministico.

### Creare una nuova migrazione

Dopo aver modificato le collections:

```bash
pnpm payload migrate:create
```

Questo genera un file in `src/migrations/` con le istruzioni SQL.

### Applicare le migrazioni

In locale:
```bash
pnpm payload migrate
```

In produzione, le migrazioni vengono eseguite automaticamente all'avvio del container.

### Workflow

1. Modifica le collections in locale
2. Esegui `pnpm payload migrate:create`
3. Verifica il file di migrazione generato
4. Committa i file di migrazione
5. Push su GitHub → Cloud Run applica automaticamente le migrazioni

## Deploy su Google Cloud Run

Il deploy avviene automaticamente tramite Cloud Build quando viene fatto push sul branch `main`.

### Architettura

```
GitHub (main) → Cloud Build → Container Registry → Cloud Run
                                                      ↓
                                               Cloud SQL (PostgreSQL)
                                                      ↓
                                               Cloud Storage (Media)
```

### Variabili d'ambiente in produzione

Configurate in Cloud Run tramite Secret Manager:

| Variabile | Descrizione |
|-----------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL con Cloud SQL |
| `PAYLOAD_SECRET` | Chiave segreta per JWT |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pubblico del servizio |
| `GOOGLE_CLIENT_ID` | Client ID OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth |
| `GCS_BUCKET` | Nome bucket Cloud Storage |
| `GCP_PROJECT_ID` | ID progetto GCP |

### Configurazione iniziale GCP

1. **Cloud SQL**: Istanza PostgreSQL 17 nella stessa regione
2. **Secret Manager**: Secrets per le variabili sensibili
3. **Cloud Storage**: Bucket per i media
4. **IAM**: Service account con permessi per SQL, Storage e Secrets
5. **Cloud Build**: Trigger collegato al repository GitHub

## Struttura del Progetto

```
src/
├── access/              # Logiche di controllo accessi (RBAC)
├── app/                 # Next.js App Router
│   ├── (frontend)/      # Pagine frontend pubbliche
│   └── (payload)/       # Pagine amministrative Payload
├── collections/         # Definizioni delle Collezioni
│   ├── factories/       # Factory functions per collezioni
│   └── fields/          # Field riutilizzabili
├── components/          # Componenti React Custom (Admin UI)
├── hooks/               # Hook Payload (lifecycle, cleanup referenze)
├── lib/                 # Librerie e utility (migration, fetcher)
├── migrations/          # File di migrazione database
├── plugins/             # Plugin Payload custom
└── payload.config.ts    # Configurazione principale
```

## Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `pnpm dev` | Avvia server di sviluppo |
| `pnpm build` | Build di produzione |
| `pnpm start` | Avvia server di produzione |
| `pnpm payload migrate` | Esegue le migrazioni |
| `pnpm payload migrate:create` | Crea nuova migrazione |
| `pnpm generate:types` | Genera tipi TypeScript |
| `pnpm generate:importmap` | Rigenera import map componenti |

## Import Map e Plugin Condizionali

### Cos'è l'Import Map

L'importMap (`src/app/(payload)/admin/importMap.js`) è un file generato automaticamente che mappa i path dei componenti React alle loro implementazioni. Viene generato durante `next build` e deve contenere **tutti** i componenti che verranno usati a runtime nell'admin panel.

### ⚠️ Problema Critico: Plugin con Variabili d'Ambiente

**Sintomo**: Pagina admin bianca in produzione (Cloud Run) con errore nei log:
```
getFromImportMap: PayloadComponent not found in importMap {
  key: '@payloadcms/storage-gcs/client#GcsClientUploadHandler'
}
```

**Causa**: Plugin condizionali esclusi dalla config durante il build locale causano componenti mancanti nell'importMap.

#### Come funziona

1. **Durante il build Docker** (senza `GCS_BUCKET`):
   - Se il plugin è escluso condizionalmente: `const plugin = env.VAR ? [plugin(...)] : []`
   - Il plugin non viene mai chiamato
   - I suoi componenti client **non entrano nell'importMap**
   - L'importMap viene compilata nel bundle Next.js

2. **A runtime su Cloud Run** (con `GCS_BUCKET`):
   - Il plugin si attiva e registra i suoi componenti
   - Payload cerca i componenti nell'importMap pre-generata
   - Non li trova → pagina bianca

#### ✅ Soluzione Corretta

**Non escludere mai i plugin condizionalmente dall'array**. Usa invece l'opzione `enabled`:

```typescript
// ❌ SBAGLIATO - causa importMap mancante
const gcsPlugin = process.env.GCS_BUCKET
  ? [gcsStorage({...})]
  : []

// ✅ CORRETTO - componenti sempre nell'importMap
const gcsPlugin = gcsStorage({
  collections: { media: true },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  enabled: Boolean(process.env.GCS_BUCKET),  // ← plugin disabilitato ma componenti registrati
})
```

Con `enabled: false`, il plugin:
- ✅ Registra i suoi componenti nell'importMap (tramite `initClientUploads`)
- ✅ NON modifica le collections
- ✅ NON aggiunge endpoint server

In produzione con `enabled: true`, tutto funziona normalmente.

### Quando rigenerare l'importMap

| Azione | Comando | Note |
|--------|---------|------|
| Aggiungi componenti custom | `npx payload generate:importmap` | Standard |
| Modifica path componenti admin | `npx payload generate:importmap` | Standard |
| Dopo modifiche ai plugin | `npx payload generate:importmap` | Se usi `enabled` correttamente |

**Nota**: Con la configurazione corretta del plugin GCS (usando `enabled`), non serve più passare variabili d'ambiente dummy al comando di generazione.

## Troubleshooting

### Pagina Admin Bianca su Cloud Run

**Sintomo**: L'admin panel funziona in locale ma mostra una pagina bianca in produzione.

**Causa più comune**: Componenti mancanti nell'importMap a causa di plugin condizionali.

**Soluzione**:
1. Verifica i log di Cloud Run per l'errore esatto
2. Se vedi `getFromImportMap: PayloadComponent not found`:
   - Controlla che tutti i plugin siano sempre inclusi in `payload.config.ts`
   - Usa l'opzione `enabled` invece di escludere condizionalmente
   - Rigenera l'importMap: `npx payload generate:importmap`
3. Verifica che il commit includa `importMap.js` aggiornato
4. Rideploya su Cloud Run

**Prevenzione**: Segui sempre il pattern `enabled` per plugin con variabili d'ambiente.

### Errori di Compilazione TypeScript

**Sintomo**: Errori TypeScript dopo modifiche alle collections.

**Soluzione**:
```bash
pnpm generate:types
npx tsc --noEmit
```

### Login Google non funziona

**Sintomo**: Errore durante il redirect OAuth.

**Verifica**:
1. `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` configurati
2. Redirect URI autorizzato in Google Cloud Console:
   - Locale: `http://localhost:3000/api/users/oauth/google/callback`
   - Produzione: `https://your-domain.com/api/users/oauth/google/callback`

### Scroll Verticale nella Pagina di Login

**Sintomo**: Presenza di scroll inutile e bottone non centrato verticalmente.

**Causa**: I wrapper generati da Payload (`section.login`, `.template-minimal`) hanno padding/margin di default.

**Soluzione**: Già implementata in `src/app/(payload)/custom.scss`:
```scss
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

### Database Connection Error

**Sintomo**: Impossibile connettersi al database.

**Verifica**:
- `DATABASE_URL` corretto
- Database PostgreSQL avviato
- Cloud SQL Proxy attivo (se usi Cloud SQL)
- Firewall/VPC configurato correttamente

### Media Upload Fails

**Sintomo**: Upload di immagini fallisce in produzione.

**Verifica**:
1. `GCS_BUCKET` e `GCP_PROJECT_ID` configurati
2. Service account ha permessi su Cloud Storage
3. Plugin GCS configurato con `enabled: true` in produzione

## Contribuire

1. Segui le regole definite in `AGENTS.md` e `.cursor/rules/`
2. Esegui `pnpm generate:types` dopo modifiche alle collections
3. Crea sempre una migrazione per modifiche allo schema
4. Testa localmente prima di fare push
5. Verifica che l'importMap sia aggiornato se modifichi plugin o componenti

## Licenza

MIT
