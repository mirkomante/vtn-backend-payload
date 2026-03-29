# Guida allo Sviluppo — vtn-backend-payload

> Verificato il: 2026-03-29

---

## Prerequisiti

- Node.js `^18.20.2 || >=20.9.0` (consigliato: v20+)
- PostgreSQL 17 (locale o Cloud SQL Proxy)
- pnpm (mai npm o yarn)
- Account Google Cloud con OAuth 2.0 configurato

---

## Setup locale

### 1. Clona e installa

```bash
git clone <repository-url>
cd vtn-backend-payload
pnpm install
```

### 2. Variabili d'ambiente

```bash
cp .env.example .env
```

**Obbligatorie in locale:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
PAYLOAD_SECRET=your-secret-key-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**GCS — opzionali in locale, obbligatorie in produzione:**

| Variabile | Usata da | Descrizione |
|---|---|---|
| `GCS_BUCKET` | collection `media` | Bucket GCS per media generici |
| `GCS_MENU_BUCKET` | `media-ristorante` + Smart Webhook | Bucket GCS per logo/icone menu + `disponibilita.json` |
| `GCP_PROJECT_ID` | entrambi i plugin GCS + Pub/Sub | ID progetto Google Cloud |

> Se GCS non è configurato: media salvati in `/media` locale, Smart Webhook in mock mode.

**Tutte le variabili d'ambiente:**

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `PAYLOAD_SECRET` | ✅ | Chiave JWT (minimo 32 caratteri) |
| `PAYLOAD_PUBLIC_SERVER_URL` | ✅ | URL pubblico del server (usato per OAuth redirect) |
| `GOOGLE_CLIENT_ID` | ✅ | Client ID OAuth 2.0 da Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ | Client Secret OAuth 2.0 |
| `GCS_BUCKET` | ❌ locale / ✅ prod | Bucket GCS per `media` |
| `GCS_MENU_BUCKET` | ❌ locale / ✅ prod | Bucket GCS per `media-ristorante` + Smart Webhook |
| `GCP_PROJECT_ID` | ❌ locale / ✅ prod | ID progetto GCP |
| `NODE_ENV` | automatico | `development` attiva mock mode Smart Webhook |

> ⚠️ `GCS_FRONTEND_BUCKET` è **deprecato** — sostituito da `GCS_MENU_BUCKET`.

### 3. Avvio

```bash
pnpm dev
```

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

Login: solo Google OAuth — clicca "Accedi con Google" nella pagina di login.

---

## Comandi pnpm

| Comando | Descrizione |
|---|---|
| `pnpm dev` | Server di sviluppo (hot reload) |
| `pnpm build` | Build di produzione |
| `pnpm start` | Avvia server di produzione |
| `pnpm payload migrate` | Esegue migrazioni pendenti |
| `pnpm payload migrate:create` | Crea nuova migrazione |
| `pnpm generate:types` | Genera `src/payload-types.ts` |
| `pnpm generate:importmap` | Rigenera `importMap.js` per componenti custom |

> ⚠️ **CRITICO** — Per rigenerare l'importMap con plugin GCS condizionale:
> ```bash
> GCS_BUCKET=dummy GCP_PROJECT_ID=dummy pnpm generate:importmap
> ```
> Senza questo, la pagina admin sarà bianca in produzione.

---

## Migrazioni database

Le migrazioni sono in `src/migrations/`. **Non modificare mai file di migrazione esistenti.**

### Creare una nuova migrazione

```bash
pnpm payload migrate:create nome-migrazione
```

### Applicare migrazioni

In locale:
```bash
pnpm payload migrate
```

In produzione (Cloud Run): le migrazioni vengono applicate automaticamente al boot:
```
yes | npx payload migrate || true && npx next start
```

### Storico migrazioni (13 totali)

| # | Nome | Data |
|---|---|---|
| 1 | `20260204_191002` | 04 Feb 2026 |
| 2 | `20260221_125418` | 21 Feb 2026 |
| 3 | `20260221_163732` | 21 Feb 2026 |
| 4 | `20260221_164516` | 21 Feb 2026 |
| 5 | `20260221_165818` | 21 Feb 2026 |
| 6 | `20260228_121154` | 28 Feb 2026 |
| 7 | `20260301_094851` | 01 Mar 2026 |
| 8 | `20260301_112246` | 01 Mar 2026 |
| 9 | `20260301_114921` | 01 Mar 2026 |
| 10 | `20260301_131512_add_order_fields` | 01 Mar 2026 |
| 11 | `20260301_150108_create_ordinamento_menu` | 01 Mar 2026 |
| 12 | `20260301_155509_remove_order_fields` | 01 Mar 2026 |
| 13 | `20260301_163621_add_drafts_ordinamento_menu` | 01 Mar 2026 |

---

## Connessione a Cloud SQL (sviluppo con DB di produzione)

```bash
# Autenticazione
gcloud auth login
gcloud auth application-default login

# Avvia proxy
./cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME

# .env
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

---

## Deploy su Cloud Run

Il deploy avviene automaticamente via Cloud Build al push su `main`.

**Variabili d'ambiente da configurare in Cloud Run:**
- Tutte quelle elencate sopra (obbligatorie + GCS)
- `DATABASE_URL` con Unix socket: `postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE`

**Build Docker:**
- Immagine base: `node:22.17.0-alpine` (multi-stage)
- `GCS_BUCKET` e `GCP_PROJECT_ID` passati come `ARG` al build per garantire che il plugin GCS sia nell'importMap

---

## Generazione tipi TypeScript

Dopo ogni modifica allo schema:

```bash
pnpm generate:types
```

Questo aggiorna `src/payload-types.ts` con i tipi generati da Payload.

**Validazione TypeScript:**
```bash
npx tsc --noEmit
```

---

## Configurazione GCS bucket (produzione)

Per ogni bucket (`GCS_BUCKET` e `GCS_MENU_BUCKET`), verificare in Google Cloud Console:

| Tab | Impostazione | Valore richiesto |
|---|---|---|
| Permissions | `allUsers` → `Storage Object Viewer` | Deve esistere |
| Configuration | Access control | `Uniform` (non Fine-grained) |
| Configuration | Public access prevention | `Not enforced` |

**Verifica al boot** (log Cloud Run):
```
[GCS Storage] GCS_BUCKET: <bucket-name>
[GCS Storage] GCS_MENU_BUCKET: <menu-bucket-name>
[GCS Storage] Plugin media abilitato: true
[GCS Storage] Plugin media-ristorante abilitato: true
```

---

## Regole di sviluppo (obbligatorie)

1. **Lingua**: codice in TypeScript, commenti in italiano, slug/campi in italiano
2. **Zero `any` espliciti** — TypeScript strict mode
3. **Migrazioni**: mai modificare file esistenti, solo aggiungere nuovi
4. **`payload.config.ts`**: file critico, modifiche hanno effetti a cascata
5. **Documentazione**: aggiornare `/docs` prima di dichiarare un task completato
6. **CHANGELOG**: aggiornare `docs/CHANGELOG.md` ad ogni modifica

Vedi `.cursor/rules/000-always.mdc` per le regole complete.
