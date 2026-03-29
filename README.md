# vtn-backend-payload

Backend headless per la piattaforma **Vietnamonamour** — gestione menu digitale ristorante, carta vini, configurazioni, autenticazione e webhook intelligente per rebuild frontend.

Basato su **Payload CMS 3.74** · **Next.js 15** · **PostgreSQL 17** · **Google Cloud Run**

---

## Stack tecnologico

| Componente | Versione |
|---|---|
| PayloadCMS | 3.74.0 |
| Next.js | 15.4.10 (App Router) |
| Node.js | `^18.20.2 \|\| >=20.9.0` |
| PostgreSQL | 17 (Cloud SQL in prod) |
| TypeScript | 5.7.3 (strict mode) |
| Package manager | pnpm |
| Auth | Google OAuth 2.0 (`payload-oauth2`) |
| Storage | Google Cloud Storage (doppio bucket) |
| Messaggistica | Google Cloud Pub/Sub |

---

## Documentazione

### Per sviluppatori

| Documento | Contenuto |
|---|---|
| [`docs/SVILUPPO.md`](./docs/SVILUPPO.md) | Setup locale, variabili d'ambiente, comandi pnpm, migrazioni, deploy |
| [`docs/ARCHITETTURA.md`](./docs/ARCHITETTURA.md) | Stack, infrastruttura GCP, diagramma flusso dati, pattern factory |
| [`docs/STATO.md`](./docs/STATO.md) | Stato attuale per area, debiti tecnici, roadmap |
| [`docs/dev/API_REFERENCE.md`](./docs/dev/API_REFERENCE.md) | Endpoint REST e GraphQL, schemi, esempi |
| [`docs/dev/SMART_WEBHOOK.md`](./docs/dev/SMART_WEBHOOK_IMPLEMENTATION.md) | Sistema webhook Traffic Cop (Fast/Slow Path, GCS, Pub/Sub) |
| [`docs/dev/TAILWIND_INTEGRATION.md`](./docs/dev/TAILWIND_INTEGRATION.md) | Tailwind CSS v4 nell'admin panel |
| [`docs/dev/TROUBLESHOOTING.md`](./docs/dev/TROUBLESHOOTING.md) | Risoluzione problemi comuni |

### Per agenti AI

| Documento | Contenuto |
|---|---|
| [`docs/ai/AGENTS.md`](./docs/ai/AGENTS.md) | Context progetto, pattern critici, regole di sviluppo Payload |
| [`docs/ai/DOCS_INDEX.md`](./docs/ai/DOCS_INDEX.md) | Indice navigabile per ingestione automatica |
| [`KB_BACKEND.md`](./KB_BACKEND.md) | Knowledge base completa — stato verificato del codice |

---

## Avvio rapido

```bash
# Installa dipendenze
pnpm install

# Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con DATABASE_URL, PAYLOAD_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Avvia in sviluppo
pnpm dev
```

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)  
Login: solo Google OAuth (email/password disabilitato)

Vedi [`docs/SVILUPPO.md`](./docs/SVILUPPO.md) per la guida completa.

---

## Deploy

Deploy automatico su Google Cloud Run via Cloud Build al push su `main`.

Vedi [`docs/SVILUPPO.md`](./docs/SVILUPPO.md) → sezione Deploy.

---

## Licenza

MIT
