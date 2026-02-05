# Sistema di Gestione Menu Ristorante (Backend Payload CMS)

Questo progetto è un backend completo basato su **Payload CMS 3.0** e **Next.js 15**, progettato per la gestione di menu digitali, carte dei vini e configurazioni per ristoranti.

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

### Problema

Alcuni plugin (come `@payloadcms/storage-gcs`) vengono attivati solo in produzione tramite variabili d'ambiente. Quando l'importMap viene generato in locale (dove queste variabili non sono configurate), i componenti client del plugin non vengono inclusi.

**Risultato in produzione**: Pagina admin bianca con errore:
```
getFromImportMap: PayloadComponent not found in importMap {
  key: '@payloadcms/storage-gcs/client#GcsClientUploadHandler'
}
```

### Soluzione

Quando modifichi plugin in `payload.config.ts`, rigenera l'importMap simulando l'ambiente di produzione:

```bash
GCS_BUCKET=dummy GCP_PROJECT_ID=dummy npx payload generate:importmap
```

### Quando rigenerare l'importMap

| Azione | Comando |
|--------|---------|
| Aggiungi/rimuovi plugin | `GCS_BUCKET=dummy GCP_PROJECT_ID=dummy npx payload generate:importmap` |
| Aggiungi componenti custom | `npx payload generate:importmap` |
| Modifica path componenti admin | `npx payload generate:importmap` |

**Regola**: Se il plugin usa variabili d'ambiente per l'attivazione condizionale, passa quelle variabili al comando di generazione.

## Contribuire

1. Segui le regole definite in `AGENTS.md` e `.cursor/rules/`
2. Esegui `pnpm generate:types` dopo modifiche alle collections
3. Crea sempre una migrazione per modifiche allo schema
4. Testa localmente prima di fare push

## Licenza

MIT
