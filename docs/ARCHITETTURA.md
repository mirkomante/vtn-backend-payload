# Architettura — vtn-backend-payload

> Verificato il: 2026-03-29  
> Basato su: lettura diretta del codice sorgente

---

## Stack tecnologico

| Componente | Versione | Note |
|---|---|---|
| **PayloadCMS** | 3.74.0 | Headless CMS, App Router |
| **Next.js** | 15.4.10 | App Router, SSR/SSG |
| **Node.js** | `^18.20.2 \|\| >=20.9.0` | |
| **PostgreSQL** | 17 | Cloud SQL in prod, locale in dev |
| **TypeScript** | 5.7.3 | strict mode |
| **Package manager** | pnpm | mai npm o yarn |
| **Auth** | `payload-oauth2` ^1.0.20 | Solo Google OAuth 2.0 |
| **Storage** | `@payloadcms/storage-gcs` 3.74.0 | Doppio bucket GCS |
| **Messaggistica** | `@google-cloud/pubsub` ^5.2.3 | Rebuild frontend |
| **Rich Text** | `@payloadcms/richtext-lexical` 3.74.0 | |
| **i18n Admin** | `@payloadcms/translations` 3.74.0 | IT + EN |
| **CSS** | Tailwind CSS v4 | Admin panel custom |

---

## Infrastruttura GCP

| Servizio | Ruolo |
|---|---|
| **Cloud Run** | Hosting backend (containerizzato Docker) |
| **Cloud SQL (PostgreSQL 17)** | Database principale |
| **Cloud Storage (GCS)** | Media upload + `disponibilita.json` |
| **Cloud Pub/Sub** | Trigger rebuild frontend |
| **Cloud Build** | CI/CD su push a `main` |

### Bucket GCS

| Variabile | Scopo |
|---|---|
| `GCS_BUCKET` | Media generici (`media` collection) |
| `GCS_MENU_BUCKET` | Media ristorante (`media-ristorante`) + `disponibilita.json` Smart Webhook |

---

## Diagramma flusso dati

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAYLOAD CMS BACKEND                          │
│                    (Next.js 15 + PostgreSQL)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  GLOBALS                                                      │   │
│  │  generali (orari)  │  menu-config (struttura)  │  ordinamento │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  COLLECTIONS — Ristorante menu                               │   │
│  │  Piatti  MenuFisso  Vini  Birre  Liquori  Cocktail  Bevande  │   │
│  │  ServizioAccessorio                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  COLLECTIONS — Ristorante configurazione                     │   │
│  │  Allergene  CategoriaPiatti  CategoriaMenuFisso              │   │
│  │  TipologiaVino/Birra/Liquore/Cocktail/Bevanda                │   │
│  │  Nazione  Regione  Zona                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SMART WEBHOOK (afterChange hook)                            │   │
│  │  Fast Path → aggrega JSON → GCS (disponibilita.json)         │   │
│  │  Slow Path → Pub/Sub topic rebuild-menu                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  GCS (GCS_BUCKET)            GCS (GCS_MENU_BUCKET)
  media generici              disponibilita.json
                                       │
                                       ▼
                              Frontend menu digitale
                              (SSG/ISR da disponibilita.json)
```

---

## Autenticazione e sicurezza

### Google OAuth 2.0 (verificato nel codice)

- Plugin: `payload-oauth2` con `strategyName: 'google'`
- `disableLocalStrategy: true` in `Users.ts` — login email/password disabilitato
- Flusso: `GET /api/users/oauth/google/authorize` → Google → `GET /api/users/oauth/google/callback` → JWT cookie → redirect `/admin`
- Errore OAuth: redirect a `/admin/login?error=oauth_failed`
- JWT salvato in cookie HTTP-only `payload-token`
- Campi `roles` e `sub` salvati nel JWT (`saveToJWT: true`)

### RBAC

| Ruolo | Permessi |
|---|---|
| `admin` | Lettura/scrittura completa su tutte le collections e globals |
| `user` | Solo lettura documenti `published` |

- Primo utente creato → automaticamente `admin` (hook `beforeChange` in `Users.ts`)
- Funzioni di accesso: `menuRistoranteReadAccess`, `menuRistoranteUpdateAccess`, `menuRistoranteDeleteAccess`, `menuImpostazioniReadAccess`, `menuImpostazioniUpdateAccess`, `menuImpostazioniDeleteAccess`

---

## Smart Webhook — Architettura Traffic Cop

**File**: `src/hooks/smartWebhook.ts`

### Fast Path
Triggerato quando:
- Campo `inLista` cambia in una collection menu
- Qualsiasi campo cambia in una collection impostazioni
- Nuovo documento creato

**Azione**: aggrega dati da 16 collections → carica `disponibilita.json` su `GCS_MENU_BUCKET`

### Slow Path
Triggerato quando cambiano campi "pesanti": `nome`, `descrizione`, `prezzo`, `prezzoCalice`, `categoria`, `tipologia`, `allergeni`, `piatti`, `servizi`, `nazione`, `regione`, `zona`

**Azione**: pubblica messaggio su Pub/Sub topic `rebuild-menu` (hardcoded)

### Mock Mode
In `NODE_ENV=development`: nessuna operazione GCP reale, solo log in console.

### FRONTEND_TARGETS (configurazione attiva)

| Target | Env var bucket | File output | Collections |
|---|---|---|---|
| `menu` | `GCS_MENU_BUCKET` | `disponibilita.json` | 16 (7 menu + 9 impostazioni) |

---

## Pattern factory collections

### `createBevandaCollection`
Genera: `Vino`, `Birra`, `Liquore`, `Cocktail`, `Bevanda`  
Parametro chiave: `nazioneOptional` (default `false`)  
- `Vino`, `Birra`, `Liquore`: nazione obbligatoria
- `Cocktail`, `Bevanda`: nazione opzionale

### `createCategoriaCollection`
Genera: `CategoriaPiatti`, `CategoriaMenuFisso`  
Campi: `inLista` (sidebar), `nome`, `descrizione`, join `elementi`

### `createSimpleCollection`
Genera: `TipologiaVino`, `TipologiaBirra`, `TipologiaLiquore`, `TipologiaCocktail`, `TipologiaBevanda`  
Campi: `nome`, `descrizione`

---

## Separazione delle responsabilità

| Dominio | Collections / Globals |
|---|---|
| Contenuto menu | `piatti`, `menu-fisso`, `vini`, `birre`, `liquori`, `cocktail`, `bevande`, `servizi-accessori` |
| Configurazione menu | `categoria-piatti`, `categoria-menu-fisso`, `tipologie-*`, `allergeni`, `nazioni`, `regioni`, `zone` |
| Struttura presentazione | Global `menu-config` |
| Ordinamento | Global `ordinamento-menu` |
| Orari e aperture | Global `generali` |
| Media | `media` (generico), `media-ristorante` (logo/icone menu) |
| Utenti | `users` |

---

## Note critiche per agenti AI

- `disableLocalStorage` va **nel plugin GCS**, non nella collection — altrimenti viene compilato a build-time in Docker come `false`
- `versions: { drafts: true }` è **obbligatorio** su ogni collection/global che usa funzioni di accesso con filtro su `_status` — senza, Payload crasha con `Cannot find field for path at _status`
- Per rigenerare l'importMap: `GCS_BUCKET=dummy GCP_PROJECT_ID=dummy npx payload generate:importmap`
- `piattiOrderBy: 'order'` nel global `ordinamento-menu` è un'opzione **obsoleta** — il campo `order` è stato rimosso dalle collections con la migrazione `20260301_155509_remove_order_fields`
