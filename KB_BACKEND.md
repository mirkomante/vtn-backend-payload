# KB — PayloadCMS Backend

> Generato il: 2026-03-08  
> Basato su: lettura completa di `/docs`, `src/`, `package.json`, `Dockerfile`, `docker-compose.yml`

---

## 1. Project Overview

### Scopo e ruolo nell'architettura headless

Questo backend è il **sistema di gestione centralizzato** per il menu digitale di un ristorante. Espone dati strutturati (piatti, vini, birre, cocktail, liquori, bevande, menu fissi, configurazioni) tramite REST API e GraphQL a uno o più frontend headless.

Il backend non serve direttamente HTML al cliente finale: pubblica un file JSON aggregato (`disponibilita.json`) su Google Cloud Storage, che i frontend consumano in modalità SSG/ISR. Modifiche strutturali triggerano un rebuild via Google Cloud Pub/Sub.

### Tech stack

| Componente | Versione / Dettaglio |
|---|---|
| **PayloadCMS** | 3.74.0 |
| **Next.js** | 15.4.10 (App Router) |
| **Node.js** | `^18.20.2 \|\| >=20.9.0` |
| **Database** | PostgreSQL (via `@payloadcms/db-postgres` + Drizzle ORM) |
| **Storage media** | Google Cloud Storage (`@payloadcms/storage-gcs` 3.74.0) |
| **Rich Text** | Lexical (`@payloadcms/richtext-lexical` 3.74.0) |
| **Auth** | Google OAuth 2.0 (`payload-oauth2` ^1.0.20) — login email/password **disabilitato** |
| **Messaggistica** | Google Cloud Pub/Sub (`@google-cloud/pubsub` ^5.2.3) |
| **Lingua** | TypeScript 5.7.3 |
| **Package manager** | pnpm |
| **i18n Admin** | Italiano + Inglese (`@payloadcms/translations`) |

### Note di deploy

- **Hosting**: Google Cloud Run (containerizzato con Docker)
- **CI/CD**: Cloud Build con trigger su push al branch `main`
- **Database**: Cloud SQL (PostgreSQL 17) — connessione via Unix socket in produzione
- **Immagine Docker**: `node:22.17.0-alpine`, multi-stage build
- **Avvio produzione**: `yes | npx payload migrate || true && npx next start` (migrazioni automatiche al boot)
- **Build-time trap GCS**: `GCS_BUCKET` e `GCP_PROJECT_ID` vengono passati come `ARG` durante il build per garantire che il plugin GCS sia incluso nell'importMap (evita pagina bianca admin in produzione)

---

## 2. Architecture Summary

### Diagramma (testo)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAYLOAD CMS BACKEND                          │
│                    (Next.js 15 + PostgreSQL)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  GLOBALS                                                      │   │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐  │   │
│  │  │  generali    │  │  menu-config     │  │ordinamento-menu│  │   │
│  │  │  (orari,     │  │  (struttura      │  │  (ordine       │  │   │
│  │  │   festività) │  │   sezioni menu)  │  │   categorie,   │  │   │
│  │  └──────────────┘  └──────────────────┘  │   sort/group)  │  │   │
│  │                                          └────────────────┘  │   │
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
│  │  COLLECTIONS — Sistema                                       │   │
│  │  Users  Media  MediaRistorante                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SMART WEBHOOK (afterChange hook)                            │   │
│  │  Fast Path → aggrega JSON → GCS (disponibilita.json)         │   │
│  │  Slow Path → Pub/Sub → rebuild completo frontend             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  GCS (media generici)         GCS (menu bucket)
  GCS_BUCKET                   GCS_MENU_BUCKET
                                       │
                                       ▼
                              Frontend menu digitale
                              (SSG/ISR da disponibilita.json)
```

### Separazione delle responsabilità

| Dominio | Collections / Globals |
|---|---|
| **Contenuto menu** | `piatti`, `menu-fisso`, `vini`, `birre`, `liquori`, `cocktail`, `bevande`, `servizi-accessori` |
| **Configurazione menu** | `categoria-piatti`, `categoria-menu-fisso`, `tipologie-*`, `allergeni`, `nazioni`, `regioni`, `zone` |
| **Struttura presentazione** | Global `menu-config` (quali sezioni mostrare, visibilità per fascia oraria) |
| **Ordinamento** | Global `ordinamento-menu` (ordine categorie, sort/groupBy per sezione) |
| **Orari e aperture** | Global `generali` (orari settimanali, fasce pranzo/cena, eccezioni/festività) |
| **Media** | `media` (generico sito), `media-ristorante` (logo e icone menu) |
| **Utenti** | `users` (RBAC admin/user, solo Google OAuth) |

---

## 3. Collections

### Users

- **Slug**: `users`
- **File**: `src/collections/Users.ts`
- **Gruppo admin**: `Admin`
- **Scopo**: Gestione utenti con RBAC. Login via Google OAuth **esclusivamente** (`disableLocalStrategy: true`).
- **Campi**:

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `email` | text (auth) | ✅ | Gestito da Payload auth |
| `roles` | select (hasMany) | ✅ | `['admin', 'user']`, default `['user']`, salvato nel JWT |
| `name` | text | ❌ | Nome utente |
| `sub` | text | ❌ | Google OAuth subject ID, unique, nascosto nell'admin, salvato nel JWT |

- **Hooks**: `beforeChange` — se è il primo utente creato, lo rende automaticamente `admin`
- **Access control**: nessuna funzione custom — accesso gestito dall'auth Payload di default
- **Note**: ⚠️ Il campo `roles` è salvato nel JWT (`saveToJWT: true`) per evitare lookup DB nelle funzioni di accesso

---

### Piatti

- **Slug**: `piatti`
- **File**: `src/collections/Piatti.ts`
- **Gruppo admin**: `Ristorante menu`
- **Scopo**: Piatti del menu con prezzo, allergeni, categoria e flag dietetici
- **Versioni/Drafts**: ✅ abilitato
- **Campi**:

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `inLista` | checkbox | ✅ | Default `true`. Sidebar. Toggle interattivo nella lista (`InListaToggleCell`) |
| `soloMenuFissi` | checkbox | ❌ | Default `false`. Sidebar. Esclude dal menu pubblico |
| `nome` | text | ✅ | Unique, indexed |
| `prezzo` | number | ✅ | Min 0, max 99999999.99, 2 decimali |
| `categoria` | relationship → `categoria-piatti` | ✅ | maxDepth 1, indexed |
| `descrizione` | textarea | ❌ | |
| `glutenFree` | checkbox | ❌ | Default `false` |
| `noUovo` | checkbox | ❌ | Default `false` |
| `noLatticini` | checkbox | ❌ | Default `false` |
| `vegan` | checkbox | ❌ | Default `false` |
| `allergeni` | relationship → `allergeni` (hasMany) | ❌ | maxDepth 1 |
| `menuFissi` | join ← `menu-fisso.piatti` | — | Sola lettura, Tab "Utilizzo" |

- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**:
  - `afterChange`: `createSmartWebhook()` — aggiorna `disponibilita.json` o trigge rebuild
  - `beforeDelete`: `createCleanupHook({ targetCollection: 'menu-fisso', relationshipField: 'piatti' })` — rimuove riferimenti orfani

---

### MenuFisso

- **Slug**: `menu-fisso`
- **File**: `src/collections/MenuFisso.ts`
- **Gruppo admin**: `Ristorante menu`
- **Scopo**: Menu fissi / menu degustazione con piatti e servizi inclusi
- **Versioni/Drafts**: ✅
- **Campi**:

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `inLista` | checkbox | ✅ | Default `true`. Sidebar |
| `nome` | text | ✅ | Unique, indexed |
| `categoria` | relationship → `categoria-menu-fisso` | ✅ | maxDepth 1, indexed |
| `prezzo` | number | ✅ | Max 99999999.99 |
| `descrizione` | textarea | ❌ | |
| `piatti` | relationship → `piatti` (hasMany) | ❌ | maxDepth 1 |
| `servizi` | relationship → `servizi-accessori` (hasMany) | ❌ | maxDepth 1 |

- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Vino

- **Slug**: `vini`
- **File**: `src/collections/Vino.ts` → factory `createBevandaCollection`
- **Gruppo admin**: `Ristorante menu`
- **Scopo**: Schede vino dettagliate (rosso, bianco, rosé, bollicine)
- **Versioni/Drafts**: ✅
- **Campi** (via factory con `campiAggiuntivi` completi):

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `inLista` | checkbox | ✅ | Sidebar |
| `nome` | text | ✅ | Unique |
| `descrizione` | textarea | ❌ | |
| `prezzo` | number | ✅ | Prezzo bottiglia |
| `prezzoCalice` | number | ❌ | Prezzo al calice |
| `tipologia` | relationship → `tipologie-vino` | ✅ | indexed |
| `grado` | text | ❌ | es. "13.5%" |
| `capacita` | text | ❌ | es. "750ml" |
| `anno` | text | ❌ | es. "2020", "NV" |
| `cantina` | text | ❌ | Nome cantina produttrice |
| `certificazione` | text | ❌ | es. DOC, DOCG, IGT |
| `nazione` | relationship → `nazioni` | ✅ | **Obbligatorio** per vini |
| `regione` | relationship → `regioni` | ❌ | indexed |
| `zona` | relationship → `zone` | ❌ | indexed |

- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Birra

- **Slug**: `birre`
- **File**: `src/collections/Birra.ts` → factory `createBevandaCollection`
- **Scopo**: Birre artigianali e industriali. Nazione **obbligatoria**.
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`, `prezzo`, `tipologia` (→ `tipologie-birra`), `grado`, `capacita`, `nazione` (required), `inLista`
- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Liquore

- **Slug**: `liquori`
- **File**: `src/collections/Liquore.ts` → factory `createBevandaCollection`
- **Scopo**: Distillati e amari. Nazione **obbligatoria**.
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`, `prezzo`, `tipologia` (→ `tipologie-liquore`), `grado`, `capacita`, `invecchiamento`, `nazione` (required), `inLista`
- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Cocktail

- **Slug**: `cocktail`
- **File**: `src/collections/Cocktail.ts` → factory `createBevandaCollection`
- **Scopo**: Cocktail e drink. Nazione **opzionale** (es. Mojito non ha origine specifica).
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`, `prezzo`, `tipologia` (→ `tipologie-cocktail`), `nazione` (optional), `inLista`
- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Bevanda

- **Slug**: `bevande`
- **File**: `src/collections/Bevanda.ts` → factory `createBevandaCollection`
- **Scopo**: Acqua, bibite, caffè. Nazione **opzionale**.
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`, `prezzo`, `tipologia` (→ `tipologie-bevanda`), `nazione` (optional), `inLista`
- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### ServizioAccessorio

- **Slug**: `servizi-accessori`
- **File**: `src/collections/ServizioAccessorio.ts`
- **Gruppo admin**: `Ristorante menu`
- **Scopo**: Servizi extra inclusi nei menu fissi (es. coperto, pane)
- **Versioni/Drafts**: ✅
- **Campi**: `inLista` (sidebar), `nome`, `prezzo`, `descrizione`, `menuFissi` (join ← `menu-fisso.servizi`)
- **Access**: `menuRistoranteReadAccess` / `menuRistoranteUpdateAccess` / `menuRistoranteDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()` | `beforeDelete`: cleanup da `menu-fisso.servizi`

---

### Allergene

- **Slug**: `allergeni`
- **File**: `src/collections/Allergene.ts`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Gestione centralizzata allergeni
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`, `piatti` (join ← `piatti.allergeni`)
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()` | `beforeDelete`: cleanup da `piatti.allergeni`

---

### CategoriaPiatti

- **Slug**: `categoria-piatti`
- **File**: `src/collections/CategoriaPiatti.ts` → factory `createCategoriaCollection`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Categorie gerarchiche dei piatti (es. Antipasti, Primi, Secondi)
- **Versioni/Drafts**: ✅
- **Campi**: `inLista` (sidebar), `nome`, `descrizione`, `elementi` (join ← `piatti.categoria`)
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### CategoriaMenuFisso

- **Slug**: `categoria-menu-fisso`
- **File**: `src/collections/CategoriaMenuFisso.ts` → factory `createCategoriaCollection`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Tipologie di menu fisso (es. Degustazione, Business Lunch)
- **Versioni/Drafts**: ✅
- **Campi**: `inLista` (sidebar), `nome`, `descrizione`, `elementi` (join ← `menu-fisso.categoria`)
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### TipologiaVino / TipologiaBirra / TipologiaLiquore / TipologiaCocktail / TipologiaBevanda

- **Slug**: `tipologie-vino`, `tipologie-birra`, `tipologie-liquore`, `tipologie-cocktail`, `tipologie-bevanda`
- **File**: `src/collections/Tipologie.ts` → factory `createSimpleCollection`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Classificazioni trasversali delle bevande (es. Vini Rossi, Birre Artigianali)
- **Versioni/Drafts**: ✅
- **Campi**: `nome`, `descrizione`
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`
- **Hooks**: `afterChange`: `createSmartWebhook()`

---

### Nazione

- **Slug**: `nazioni`
- **File**: `src/collections/Nazione.ts`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Dati geografici — nazioni di origine dei prodotti
- **Versioni/Drafts**: ✅
- **Campi**: `nome` (unique, indexed), `sigla` (ISO alpha-3, max 3 chars, unique, auto-uppercase via `beforeChange` hook)
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`

---

### Regione

- **Slug**: `regioni`
- **File**: `src/collections/Regione.ts`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Regioni di produzione (es. Toscana, Piemonte)
- **Versioni/Drafts**: ✅
- **Campi**: `nome` (indexed), `nazione` (relationship → `nazioni`, required)
- **Hooks**: `beforeChange` — validazione unicità `(nome, nazione)` con `APIError` se duplicato
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`

---

### Zona

- **Slug**: `zone`
- **File**: `src/collections/Zona.ts`
- **Gruppo admin**: `Ristorante configurazione`
- **Scopo**: Zone di produzione (es. Chianti, Barolo)
- **Versioni/Drafts**: ✅
- **Campi**: `nome` (indexed), `nazione` (relationship → `nazioni`, required), `regione` (relationship → `regioni`, required)
- **Hooks**: `beforeChange` — validazione unicità `(nome, regione)` con `APIError` se duplicato
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess` / `menuImpostazioniDeleteAccess`

---

### Media

- **Slug**: `media`
- **File**: `src/collections/Media.ts`
- **Gruppo admin**: `Admin`
- **Scopo**: Upload media generici del sito (uso futuro)
- **Campi**: `alt` (text, required)
- **Upload**: `adminThumbnail` genera URL GCS da `GCS_BUCKET`
- **Hooks**: `afterRead` — sovrascrive `doc.url` con URL pubblico GCS (`GCS_BUCKET`)
- **Access**: `read: () => true` (pubblico), write/delete default Payload

---

### MediaRistorante

- **Slug**: `media-ristorante`
- **File**: `src/collections/MediaRistorante.ts`
- **Gruppo admin**: `Ristorante impostazioni`
- **Scopo**: Upload immagini menu ristorante (logo, icone sezioni). Bucket separato da `media`.
- **Campi**: `alt` (text, required)
- **Upload**: `adminThumbnail` genera URL GCS da `GCS_MENU_BUCKET`
- **Hooks**: `afterRead` — sovrascrive `doc.url` con URL pubblico GCS (`GCS_MENU_BUCKET`)
- **Access**: `read: () => true` | `create/update`: `menuImpostazioniUpdateAccess` | `delete`: `menuImpostazioniDeleteAccess`

---

## 4. Globals

### generali

- **File**: `src/globals/Generali.ts`
- **Slug**: `generali`
- **Label admin**: `Generali`
- **Gruppo admin**: `Ristorante impostazioni`
- **Versioni/Drafts**: ✅ (obbligatorio per `menuImpostazioniReadAccess` che filtra su `_status`)
- **Scopo**: Single Source of Truth per orari di apertura, fasce pranzo/cena, eccezioni e festività
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`

**Struttura campi**:

| Tab | Campo | Tipo | Note |
|---|---|---|---|
| Orari Settimanali | `scheduleWeekly` | array (min/max 7) | Ogni elemento: `day` (select), `isOpen` (checkbox), `hours` (array condizionale) |
| Fasce Pranzo/Cena | `lunchSlot` | group | `start` + `end` (select HH:MM ogni 15min), default 12:00–15:00 |
| Fasce Pranzo/Cena | `dinnerSlot` | group | `start` + `end`, default 19:00–23:00 |
| Chiusure e Festività | `importaFestivitaUI` | ui | Bottone `ImportaFestivitaButton` (importa festività italiane via `date-holidays`) |
| Chiusure e Festività | `exceptions` | array | `date`, `type` (`chiusura-totale`/`orario-variato`), `reason`, `variedHours` (condizionale) |

**Componenti UI personalizzati**: `ScheduleWeeklyRowLabel`, `CambioOrarioRowLabel`, `ChiusuraRowLabel`, `ImportaFestivitaButton`

---

### menu-config

- **File**: `src/globals/MenuConfig.ts`
- **Slug**: `menu-config`
- **Label admin**: `Layout`
- **Gruppo admin**: `Ristorante configurazione`
- **Versioni/Drafts**: ✅
- **Scopo**: Struttura e visibilità del menu — quali sezioni mostrare, con quale titolo, logo e regole di visibilità per fascia oraria/giorno
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`

**Struttura campi**:

| Posizione | Campo | Tipo | Note |
|---|---|---|---|
| Tab 1 Generale | `title` | text | Titolo del menu digitale |
| Tab 1 Generale | `annotazione` | richText (Lexical) | Bold, Italic, Underline, UnorderedList, Link |
| Tab 2 Menu Standard | `standardItems` | array | Sezioni sempre attive |
| Tab 3 Menu Speciale | `specialItems` | array | Visibile solo se `isActive === true` |
| Sidebar (root) | `logo` | upload → `media-ristorante` | Logo ristorante |
| Sidebar (root) | `isActive` | checkbox | Attiva menu speciale |
| Sidebar (root) | `activeRange` | group | `start` + `end` (date), condizionale su `isActive` |

**Struttura item menu** (campi condivisi `standardItems` / `specialItems`):

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `label` | text | ✅ | Titolo sezione frontend |
| `sourceCollection` | select (hasMany) | ✅ | `piatti`, `vini`, `birre`, `liquori`, `cocktail`, `bevande`, `servizi-accessori`, `menu-fisso` |
| `filterMode` | select | ✅ | `all`/`include`/`exclude` — visibile solo con sorgente singola |
| `targetCategories` | relationship (polimorfica) | ❌ | Visibile solo se `filterMode != 'all'` e sorgente singola. `filterOptions` dinamico |
| `visibility` | select | ✅ | `always`/`lunch_only`/`dinner_only` |
| `activeDays` | select (hasMany) | ❌ | Giorni attivi (vuoto = tutti i giorni) |
| `icona` | upload → `media-ristorante` | ❌ | Icona sezione |

**Componenti UI**: `MenuItemRowLabel` (RowLabel per `standardItems` e `specialItems`)

---

### ordinamento-menu

- **File**: `src/globals/OrdinamentoMenu.ts`
- **Slug**: `ordinamento-menu`
- **Label admin**: `Ordinamento`
- **Gruppo admin**: `Ristorante configurazione`
- **Versioni/Drafts**: ✅ (obbligatorio per `menuImpostazioniReadAccess`)
- **Scopo**: Ordine visuale delle categorie/tipologie (drag & drop) e regole di sort/groupBy per ogni sezione del menu
- **Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`

**Struttura per tab**:

| Tab | Campo relationship | orderBy default | groupBy default |
|---|---|---|---|
| Piatti | `categoriePiatti` → `categoria-piatti` | `order` | `nessuno` |
| Vini | `tipologieVino` → `tipologie-vino` | `order` | `regione` |
| Liquori | `tipologieLiquore` → `tipologie-liquore` | `order` | `nazione` |
| Birre | `tipologieBirra` → `tipologie-birra` | `order` | `nessuno` |
| Cocktail | `tipologieCocktail` → `tipologie-cocktail` | `order` | `nessuno` |
| Bevande | `tipologieBevanda` → `tipologie-bevanda` | `order` | `nessuno` |

Ogni tab include anche: `{sezione}OrderBy`, `{sezione}OrderDirection`, `{sezione}GroupBy`.  
Sidebar: `noteOrdinamento` (textarea, uso interno).

---

## 5. Authentication & Access Control

### Strategia di autenticazione

- **Google OAuth 2.0** tramite `payload-oauth2` — unico metodo di login
- **Login email/password disabilitato** (`disableLocalStrategy: true` in `Users`)
- **JWT** salvato in cookie HTTP-only (`payload-token`)
- Il campo `roles` è incluso nel JWT (`saveToJWT: true`) per accesso rapido senza lookup DB
- Il campo `sub` (Google subject ID) è incluso nel JWT per identificare l'utente OAuth

**Flusso OAuth**:
1. `GET /api/users/oauth/google/authorize` → redirect a Google
2. `GET /api/users/oauth/google/callback` → riceve token, crea/aggiorna utente, redirect a `/admin`
3. In caso di errore → redirect a `/admin/login?error=oauth_failed`

### Ruoli RBAC

| Ruolo | Descrizione | Permessi |
|---|---|---|
| `admin` | Amministratore | Lettura/scrittura completa su tutte le collections e globals |
| `user` | Utente base | Solo lettura documenti `published` |

**Primo utente**: il `beforeChange` hook di `Users` assegna automaticamente il ruolo `admin` al primo utente creato.

### Funzioni di accesso

**`menuRistoranteReadAccess`** (`src/access/menuRistoranteAccess.ts`):
- Admin → `true` (tutti i documenti)
- Altri → `{ _status: { equals: 'published' } }` (solo pubblicati)

**`menuRistoranteUpdateAccess`** / **`menuRistoranteDeleteAccess`**:
- Solo `admin` → `true`
- Altri → `false`

**`menuImpostazioniReadAccess`** (`src/access/menuImpostazioniAccess.ts`):
- Identica a `menuRistoranteReadAccess`

**`menuImpostazioniUpdateAccess`** / **`menuImpostazioniDeleteAccess`**:
- Solo `admin` → `true`
- Altri → `false`

### Accesso pubblico vs autenticato

| Risorsa | Non autenticato | Autenticato (user) | Admin |
|---|---|---|---|
| Collections menu (piatti, vini, ecc.) | Solo `published` | Solo `published` | Tutti (draft + published) |
| Collections configurazione (categorie, tipologie, ecc.) | Solo `published` | Solo `published` | Tutti |
| Globals (generali, menu-config, ordinamento-menu) | Solo `published` | Solo `published` | Tutti |
| Media / MediaRistorante | Lettura pubblica | Lettura pubblica | Lettura + scrittura + eliminazione |
| Users | — | — | Completo |

> ⚠️ **CRITICO**: Le funzioni `menuImpostazioniReadAccess` e `menuRistoranteReadAccess` restituiscono `{ _status: { equals: 'published' } }` per utenti non-admin. Questo richiede **obbligatoriamente** `versions: { drafts: true }` sulla collection/global. Senza drafts, Payload crasha con `Cannot find field for path at _status`.

---

## 6. Custom Endpoints

### POST /api/migrate-data

- **File**: `src/endpoints/migrateData.ts`
- **Metodo**: `POST`
- **Path completo**: `/api/migrate-data`
- **Auth richiesta**: ✅ Sì — solo `admin`
- **Scopo**: Endpoint di migrazione one-shot per importare dati dal backend precedente. Esegue:
  1. Pulizia dati esistenti (eccetto users)
  2. Fetch dati dal backend attuale (via `src/lib/migration/fetcher.ts`)
  3. Importazione nell'ordine corretto rispettando le dipendenze (nazioni → regioni → zone → tipologie → allergeni → categorie → piatti → servizi → menu-fisso → bevande)
- **Risposta**: JSON con statistiche (`totalImported`, `totalSkipped`, `totalErrors`, `duration`, `stats[]`)
- **Note**: Accessibile tramite il widget `MigrationButton` nella dashboard admin. Usa `IDMapper` per mappare gli ID del vecchio backend ai nuovi ID Payload.

---

## 7. Media & Uploads

### Architettura a doppio bucket GCS

Il progetto usa **due plugin `gcsStorage` separati** in `payload.config.ts`:

| Collection | Plugin | Env var bucket | Scopo |
|---|---|---|---|
| `media` | `gcsPluginMedia` | `GCS_BUCKET` | Media generici del sito (uso futuro) |
| `media-ristorante` | `gcsPluginMenuMedia` | `GCS_MENU_BUCKET` | Logo e icone del menu ristorante |

**Pattern critico**: `disableLocalStorage` è configurato **nel plugin** (non nella collection) per evitare il build-time trap di Next.js in Docker (dove le env vars sono undefined al build → `false` hardcoded nel bundle).

```typescript
// ✅ CORRETTO — valutato a runtime da Node.js
media: gcsEnabled ? { disableLocalStorage: true } : true,

// ❌ SBAGLIATO — compilato nel bundle a build-time
// upload: { disableLocalStorage: Boolean(process.env.GCS_BUCKET) }
```

**Hook `afterRead`**: ogni collection sovrascrive `doc.url` con l'URL pubblico GCS ad ogni lettura, come fallback per Uniform Bucket Level Access.

**`adminThumbnail`**: genera URL GCS per le anteprime nell'admin panel.

### Configurazione bucket GCS richiesta

Per ogni bucket (`GCS_BUCKET` e `GCS_MENU_BUCKET`):
- `allUsers` → `Storage Object Viewer` (lettura pubblica)
- Access control: `Uniform` (non Fine-grained)
- Public access prevention: `Not enforced`

### Dimensioni immagini

Non sono definiti `imageSizes` nelle collection upload — nessun resize automatico.

### Restrizioni MIME type

Non configurate esplicitamente — Payload accetta tutti i tipi di file per default.

---

## 8. Plugins & Integrations

| Plugin | Versione | Scopo |
|---|---|---|
| `@payloadcms/storage-gcs` | 3.74.0 | Storage media su Google Cloud Storage (2 istanze: `gcsPluginMedia` + `gcsPluginMenuMedia`) |
| `payload-oauth2` | ^1.0.20 | Google OAuth 2.0 per autenticazione admin |
| `cancelButtonPlugin` | custom | Aggiunge bottone "Annulla" a tutte le collections e globals (sostituisce `SaveDraftButton` con `SaveDraftButtonWithCancel`) |
| `@payloadcms/db-postgres` | 3.74.0 | Adapter PostgreSQL con Drizzle ORM |
| `@payloadcms/richtext-lexical` | 3.74.0 | Editor rich text Lexical |
| `@payloadcms/translations` | 3.74.0 | Traduzioni admin (IT + EN) |
| `@google-cloud/storage` | ^7.19.0 | Client GCS per Smart Webhook |
| `@google-cloud/pubsub` | ^5.2.3 | Client Pub/Sub per rebuild frontend |
| `date-holidays` | ^3.26.8 | Calcolo festività italiane per `ImportaFestivitaButton` |

---

## 9. Email Configuration

**Non implementato**. Non è presente alcuna configurazione email nel progetto (nessun adapter email, nessun template). L'autenticazione è esclusivamente via Google OAuth e non richiede email transazionali.

---

## 10. Environment Variables

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL. Locale: `postgresql://user:pass@localhost:5432/db`. Produzione Cloud Run: Unix socket `?host=/cloudsql/PROJECT:REGION:INSTANCE` |
| `PAYLOAD_SECRET` | ✅ | Chiave segreta per firmare JWT — minimo 32 caratteri |
| `PAYLOAD_PUBLIC_SERVER_URL` | ✅ | URL pubblico del server (es. `http://localhost:3000` o `https://your-domain.com`) — usato per OAuth redirect |
| `GOOGLE_CLIENT_ID` | ✅ (OAuth) | Client ID OAuth 2.0 da Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ (OAuth) | Client Secret OAuth 2.0 |
| `GCS_BUCKET` | ❌ locale / ✅ prod | Bucket GCS per collection `media` (media generici sito) |
| `GCS_MENU_BUCKET` | ❌ locale / ✅ prod | Bucket GCS per collection `media-ristorante` + file `disponibilita.json` del Smart Webhook |
| `GCP_PROJECT_ID` | ❌ locale / ✅ prod | ID progetto Google Cloud (condiviso da entrambi i plugin GCS e da Pub/Sub) |
| `NODE_ENV` | automatico | `development` attiva mock mode nel Smart Webhook (nessuna operazione GCP reale) |

**Note**:
- Se `GCS_BUCKET` / `GCS_MENU_BUCKET` non sono impostati in locale, i media vengono salvati in `/media` locale e il Smart Webhook opera in mock mode.
- `GCS_FRONTEND_BUCKET` è **deprecato** — sostituito da `GCS_MENU_BUCKET` (breaking change).
- Il Dockerfile passa `GCS_BUCKET` e `GCP_PROJECT_ID` come `ARG` al build per garantire che il plugin GCS sia nell'importMap.

---

## 11. Current Development Status

### Completamente implementato e funzionante ✅

- Tutte le 22 collections (menu, configurazione, sistema)
- 3 Globals (generali, menu-config, ordinamento-menu)
- Autenticazione Google OAuth 2.0
- RBAC (admin/user)
- Smart Webhook con architettura multi-frontend (Fast Path GCS + Slow Path Pub/Sub)
- Doppio bucket GCS (media generici + media ristorante)
- Sistema di versioni/drafts su tutte le collections e globals
- Hook di cleanup referenze orfane (`cleanupRelationships`)
- Endpoint di migrazione dati (`/api/migrate-data`)
- Libreria di migrazione completa (`src/lib/migration/`)
- 13 migrazioni database (da 2026-02-04 a 2026-03-01)
- Componenti UI personalizzati (RowLabel, InListaToggleCell, PrezzoCell, ImportaFestivitaButton, LoginView, NavFooter, MigrationButton, SaveDraftButtonWithCancel)
- Plugin `cancelButtonPlugin` custom
- i18n admin (IT + EN)
- Tailwind CSS v4 nell'admin panel
- Dashboard widget `MigrationButton`

### Parzialmente implementato ⚠️

- **Collection `media`**: implementata ma descritta come "media generici del sito (futuro)" — non ancora usata attivamente dal frontend
- **Multi-frontend architecture**: il sistema supporta più target, ma attualmente è configurato **un solo target** (`menu`). I target `corporate` e `shop` sono commentati come "futuri"
- **`piattiOrderBy: 'order'`**: il campo `order` è stato **rimosso** dalle collections (migrazione `20260301_155509_remove_order_fields`), ma rimane come opzione nei select di `ordinamento-menu`. ⚠️ Questo è un'inconsistenza: l'opzione "Priorità manuale (campo order)" nel global non ha un campo corrispondente nelle collections.

### Non implementato ❌

- **Email**: nessuna configurazione email
- **Rate limiting**: documentato in `API_REFERENCE.md` (1000/100 req/min) ma **non implementato nel codice** — nessun middleware di rate limiting trovato
- **GraphQL schema notes**: GraphQL è abilitato di default da Payload ma non ci sono customizzazioni specifiche
- **Reservations / prenotazioni**: non presenti (il progetto è focalizzato solo sul menu digitale)
- **Short-rental site content**: non presente (il progetto è solo per ristorante)

### Known issues / TODO nei commenti

- ⚠️ `piattiOrderBy: 'order'` nel global `ordinamento-menu` referenzia un campo rimosso (vedi sopra)
- Il `docker-compose.yml` usa `node:18-alpine` mentre il Dockerfile di produzione usa `node:22.17.0-alpine` — versioni diverse
- Il `package.json` ha `"name": ""` (campo name vuoto)

---

## 12. Data Relationships Map

```
Piatti ──────────────────────────── categoria ──→ CategoriaPiatti
Piatti ──────────────────────────── allergeni ──→ Allergene (hasMany)
Piatti ←──────────────────────────── piatti ──── MenuFisso (hasMany)
MenuFisso ───────────────────────── categoria ──→ CategoriaMenuFisso
MenuFisso ───────────────────────── servizi ───→ ServizioAccessorio (hasMany)
Vino ────────────────────────────── tipologia ──→ TipologiaVino
Vino ────────────────────────────── nazione ───→ Nazione
Vino ────────────────────────────── regione ───→ Regione
Vino ────────────────────────────── zona ──────→ Zona
Birra ───────────────────────────── tipologia ──→ TipologiaBirra
Birra ───────────────────────────── nazione ───→ Nazione
Liquore ─────────────────────────── tipologia ──→ TipologiaLiquore
Liquore ─────────────────────────── nazione ───→ Nazione
Cocktail ────────────────────────── tipologia ──→ TipologiaCocktail
Cocktail ────────────────────────── nazione ───→ Nazione (optional)
Bevanda ─────────────────────────── tipologia ──→ TipologiaBevanda
Bevanda ─────────────────────────── nazione ───→ Nazione (optional)
Regione ─────────────────────────── nazione ───→ Nazione
Zona ────────────────────────────── nazione ───→ Nazione
Zona ────────────────────────────── regione ───→ Regione
MenuConfig.logo ─────────────────── upload ────→ MediaRistorante
MenuConfig.standardItems[].icona ── upload ────→ MediaRistorante
MenuConfig.specialItems[].icona ─── upload ────→ MediaRistorante
MenuConfig.targetCategories ──────── poly ─────→ CategoriaPiatti | TipologiaVino | TipologiaBirra |
                                                  TipologiaLiquore | TipologiaCocktail | TipologiaBevanda |
                                                  CategoriaMenuFisso
OrdinamentoMenu.categoriePiatti ──── rel ──────→ CategoriaPiatti (hasMany, ordered)
OrdinamentoMenu.tipologieVino ────── rel ──────→ TipologiaVino (hasMany, ordered)
OrdinamentoMenu.tipologieLiquore ─── rel ──────→ TipologiaLiquore (hasMany, ordered)
OrdinamentoMenu.tipologieBirra ───── rel ──────→ TipologiaBirra (hasMany, ordered)
OrdinamentoMenu.tipologieCocktail ── rel ──────→ TipologiaCocktail (hasMany, ordered)
OrdinamentoMenu.tipologieBevanda ─── rel ──────→ TipologiaBevanda (hasMany, ordered)
```

**Tabella relazioni cross-collection**:

| Da | Campo | A | Tipo |
|---|---|---|---|
| `piatti` | `categoria` | `categoria-piatti` | N:1 |
| `piatti` | `allergeni` | `allergeni` | N:M |
| `menu-fisso` | `categoria` | `categoria-menu-fisso` | N:1 |
| `menu-fisso` | `piatti` | `piatti` | N:M |
| `menu-fisso` | `servizi` | `servizi-accessori` | N:M |
| `vini` | `tipologia` | `tipologie-vino` | N:1 |
| `vini` | `nazione` | `nazioni` | N:1 |
| `vini` | `regione` | `regioni` | N:1 |
| `vini` | `zona` | `zone` | N:1 |
| `birre` | `tipologia` | `tipologie-birra` | N:1 |
| `birre` | `nazione` | `nazioni` | N:1 |
| `liquori` | `tipologia` | `tipologie-liquore` | N:1 |
| `liquori` | `nazione` | `nazioni` | N:1 |
| `cocktail` | `tipologia` | `tipologie-cocktail` | N:1 |
| `cocktail` | `nazione` | `nazioni` | N:1 (optional) |
| `bevande` | `tipologia` | `tipologie-bevanda` | N:1 |
| `bevande` | `nazione` | `nazioni` | N:1 (optional) |
| `regioni` | `nazione` | `nazioni` | N:1 |
| `zone` | `nazione` | `nazioni` | N:1 |
| `zone` | `regione` | `regioni` | N:1 |
| `menu-config` | `logo` | `media-ristorante` | N:1 |
| `menu-config` | `standardItems[].icona` | `media-ristorante` | N:1 |
| `menu-config` | `targetCategories` | (polimorfica) | N:M |
| `ordinamento-menu` | `categoriePiatti` | `categoria-piatti` | N:M ordered |
| `ordinamento-menu` | `tipologieVino` | `tipologie-vino` | N:M ordered |

---

## 13. API Surface

### Base URL

- **Locale**: `http://localhost:3000`
- **Produzione**: `https://your-domain.com` (Cloud Run)

### REST endpoints auto-generati da Payload

Per ogni collection `{slug}`:

| Metodo | Path | Auth | Descrizione |
|---|---|---|---|
| `GET` | `/api/{slug}` | Pubblica (solo published) | Lista documenti con paginazione |
| `GET` | `/api/{slug}/:id` | Pubblica (solo published) | Dettaglio singolo documento |
| `POST` | `/api/{slug}` | Admin | Crea documento |
| `PATCH` | `/api/{slug}/:id` | Admin | Aggiorna documento |
| `DELETE` | `/api/{slug}/:id` | Admin | Elimina documento |

**Collections disponibili**: `piatti`, `menu-fisso`, `vini`, `birre`, `liquori`, `cocktail`, `bevande`, `servizi-accessori`, `allergeni`, `categoria-piatti`, `categoria-menu-fisso`, `tipologie-vino`, `tipologie-birra`, `tipologie-liquore`, `tipologie-cocktail`, `tipologie-bevanda`, `nazioni`, `regioni`, `zone`, `media`, `media-ristorante`, `users`

**Globals** (singleton):

| Metodo | Path | Auth | Descrizione |
|---|---|---|---|
| `GET` | `/api/globals/generali` | Pubblica (solo published) | Orari e aperture |
| `POST` | `/api/globals/generali` | Admin | Aggiorna orari |
| `GET` | `/api/globals/menu-config` | Pubblica (solo published) | Struttura menu |
| `POST` | `/api/globals/menu-config` | Admin | Aggiorna struttura menu |
| `GET` | `/api/globals/ordinamento-menu` | Pubblica (solo published) | Ordinamento categorie |
| `POST` | `/api/globals/ordinamento-menu` | Admin | Aggiorna ordinamento |

**Endpoint custom**:

| Metodo | Path | Auth | Descrizione |
|---|---|---|---|
| `POST` | `/api/migrate-data` | Admin | Migrazione dati dal backend precedente |
| `GET` | `/api/users/oauth/google/authorize` | — | Avvia flusso OAuth Google |
| `GET` | `/api/users/oauth/google/callback` | — | Callback OAuth Google |

**Auth endpoints** (standard Payload):

| Metodo | Path | Descrizione |
|---|---|---|
| `POST` | `/api/users/login` | Login (disabilitato — solo OAuth) |
| `POST` | `/api/users/logout` | Logout |
| `GET` | `/api/users/me` | Utente corrente |
| `POST` | `/api/users/refresh-token` | Refresh JWT |

### GraphQL

- **Endpoint**: `POST /api/graphql`
- **Playground**: `GET /api/graphql-playground` (solo development)
- Abilitato di default da Payload — nessuna customizzazione specifica nel codice
- Schema auto-generato da Payload per tutte le collections e globals

### Parametri query REST

| Parametro | Esempio | Descrizione |
|---|---|---|
| `where[campo][operatore]` | `where[inLista][equals]=true` | Filtro |
| `sort` | `sort=-prezzo` (desc), `sort=nome` (asc) | Ordinamento |
| `limit` | `limit=20` | Paginazione |
| `page` | `page=2` | Pagina |
| `depth` | `depth=1` | Profondità popolamento relazioni |
| `select` | `select=nome,prezzo` | Campi specifici |

---

## 14. Docs vs Code Alignment

| Feature documentata | Posizione docs | Stato codice | Note |
|---|---|---|---|
| Payload CMS v3.0 backend per menu ristorante | `docs/ai/AGENTS.md` | ✅ Confermato | Versione esatta: 3.74.0 |
| PostgreSQL come database | `README.md`, `AGENTS.md` | ✅ Confermato | `@payloadcms/db-postgres` 3.74.0 |
| Google Cloud Storage per media | `AGENTS.md`, `GETTING_STARTED.md` | ✅ Confermato | Doppio plugin GCS implementato |
| Google Cloud Run come hosting | `README.md` | ✅ Confermato | Dockerfile presente e corretto |
| Collections: Piatti, MenuFisso, CategoriaPiatti, CategoriaMenuFisso | `AGENTS.md` | ✅ Confermato | Tutte implementate |
| Collections: Vino, Birra, Cocktail, Liquore, Bevanda via factory | `AGENTS.md` | ✅ Confermato | `createBevandaCollection` implementata |
| Nazione obbligatoria per Vino, Birra, Liquore | `AGENTS.md` | ✅ Confermato | `nazioneOptional: false` (default) |
| Nazione opzionale per Cocktail, Bevanda | `AGENTS.md` | ✅ Confermato | `nazioneOptional: true` |
| Global `generali` con orari settimanali, fasce pranzo/cena, eccezioni | `AGENTS.md` | ✅ Confermato | Implementato con tutti i campi documentati |
| Global `menu-config` con standardItems/specialItems/isActive/activeRange | `AGENTS.md` | ✅ Confermato | Implementato con logica condizionale |
| Global `ordinamento-menu` con 6 tab e sort/groupBy | `AGENTS.md` | ✅ Confermato | Implementato con tutti i campi |
| Smart Webhook "Traffic Cop" Fast/Slow Path | `SMART_WEBHOOK_IMPLEMENTATION.md` | ✅ Confermato | `src/hooks/smartWebhook.ts` completo |
| Multi-frontend architecture con `FRONTEND_TARGETS` | `AGENTS.md`, `SMART_WEBHOOK_IMPLEMENTATION.md` | ✅ Confermato | 1 target attivo (`menu`), futuri commentati |
| `GCS_FRONTEND_BUCKET` deprecato → `GCS_MENU_BUCKET` | `AGENTS.md`, `SMART_WEBHOOK_IMPLEMENTATION.md` | ✅ Confermato | `.env.example` aggiornato |
| `disableLocalStorage` nel plugin (non nella collection) | `AGENTS.md` | ✅ Confermato | Pattern corretto in `payload.config.ts` |
| Architettura doppio plugin GCS | `AGENTS.md` | ✅ Confermato | `gcsPluginMedia` + `gcsPluginMenuMedia` |
| `afterRead` hook per URL GCS | `AGENTS.md` | ✅ Confermato | In `Media.ts` e `MediaRistorante.ts` |
| `adminThumbnail` per anteprime GCS | `AGENTS.md` | ✅ Confermato | In `Media.ts` e `MediaRistorante.ts` |
| `versions: { drafts: true }` obbligatorio con `_status` filter | `AGENTS.md` | ✅ Confermato | Tutte le collections e globals con accesso pubblico hanno drafts |
| Rimozione campo `order` dalle collections | `docs/ai/DOCS_INDEX.md` (Marzo 2026) | ✅ Confermato | Migrazione `20260301_155509_remove_order_fields` applicata |
| `defaultSort: 'updatedAt'` dopo rimozione `order` | `AGENTS.md` | ✅ Confermato | Tutte le collections factory e Piatti/MenuFisso/ServizioAccessorio |
| Rate limiting (1000/100 req/min) | `API_REFERENCE.md` | ❌ Non implementato | Documentato ma nessun middleware trovato nel codice |
| `ImportaFestivitaButton` con `date-holidays` | `AGENTS.md` | ✅ Confermato | `src/components/ImportaFestivitaButton.tsx` + dipendenza nel `package.json` |
| Google OAuth con `payload-oauth2` | `API_REFERENCE.md` | ✅ Confermato | Configurato in `payload.config.ts` |
| `disableLocalStrategy: true` per Users | `AGENTS.md` (Auth Collection with RBAC) | ✅ Confermato | `src/collections/Users.ts` |
| `saveToJWT: true` per `roles` | `AGENTS.md` | ✅ Confermato | `src/collections/Users.ts` |
| `cancelButtonPlugin` custom | — (non documentato in /docs) | ✅ Presente nel codice | `src/plugins/cancelButtonPlugin.ts` — non documentato in /docs |
| `MigrationButton` dashboard widget | — (non documentato in /docs) | ✅ Presente nel codice | `src/components/MigrationButton.tsx` — non documentato in /docs |
| `LoginView` personalizzata | `TAILWIND_INTEGRATION.md` | ✅ Confermato | Registrata in `payload.config.ts` |
| `NavFooter` custom | — | ✅ Presente nel codice | Registrato in `payload.config.ts` |
| Endpoint `/api/migrate-data` | `API_REFERENCE.md` (webhook section, cenno) | ⚠️ Parziale | Documentato solo come "cleanup automatico" — l'endpoint di migrazione completo non è documentato in dettaglio |
| `piattiOrderBy: 'order'` come opzione nel global | `API_REFERENCE.md` | ⚠️ Inconsistenza | Il campo `order` è stato rimosso dalle collections ma rimane come opzione nel select di `ordinamento-menu` |
| `generali` come "Collection Singleton" | `DOCS_INDEX.md` keywords | ⚠️ Parziale | Nei docs è citato come "convertita da Global a Collection per controllo ordinamento sidebar" ma nel codice è implementato come **Global** (non Collection) |
| Pub/Sub topic `rebuild-menu` hardcoded | `SMART_WEBHOOK_IMPLEMENTATION.md` | ✅ Confermato | `const PUBSUB_TOPIC = 'rebuild-menu'` in `smartWebhook.ts` |
