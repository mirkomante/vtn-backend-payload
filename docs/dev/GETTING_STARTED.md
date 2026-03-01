# Guida allo Sviluppo Locale

## Prerequisiti
- Node.js v20 o superiore
- PostgreSQL 17 (locale o Cloud SQL Proxy)
- pnpm

## Installazione

1. **Clona il repository:**
   ```bash
   git clone <repository-url>
   cd vtn-backend-payload
   ```

2. **Configura le variabili d'ambiente:**
   ```bash
   cp .env.example .env
   ```

   Variabili **obbligatorie** in locale:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/database
   PAYLOAD_SECRET=your-secret-key-min-32-chars
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   Variabili **GCS — opzionali in locale, obbligatorie in produzione**:

   | Variabile | Usata da | Descrizione |
   |-----------|----------|-------------|
   | `GCS_BUCKET` | collection `media` | Bucket GCS per media generici del sito |
   | `GCS_MENU_BUCKET` | collection `media-ristorante` + Smart Webhook | Bucket GCS per logo/icone menu ristorante e per `disponibilita.json` |
   | `GCP_PROJECT_ID` | entrambi i plugin GCS | ID progetto Google Cloud |

   Se non impostate, i media vengono salvati nella cartella locale `/media` e il Smart Webhook opera in mock mode.

   > **Architettura multi-bucket**: `media` e `media-ristorante` usano bucket separati, gestiti da due istanze distinte del plugin `gcsStorage` in `payload.config.ts`. Non usare `GCS_BUCKET` per `media-ristorante` o viceversa.

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

## Connessione a Cloud SQL (opzionale)

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
