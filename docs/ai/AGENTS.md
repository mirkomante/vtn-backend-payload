# Project Context: Restaurant Menu System

## 🌍 Overview
This project is a Payload CMS (v3.0) backend for managing a restaurant's digital menu, wine list, and configurations. It uses Next.js 15, PostgreSQL, and Google Cloud Storage.

## 🏗 Domain Model (Collections)

### Ordinamento

L'ordinamento degli item nel menu è gestito **esclusivamente** dal Global `ordinamento-menu` (vedi sezione Globals). Non esiste più un campo `order` nelle collection — il `defaultSort` di tutte le collection è `updatedAt`.

Il frontend deve leggere `GET /api/globals/ordinamento-menu` per sapere:
1. L'ordine delle categorie/tipologie (array relationship ordinato dall'editor).
2. Il criterio di sort degli item (`{sezione}OrderBy` + `{sezione}OrderDirection`).
3. Se raggruppare gli item in sottosezioni (`{sezione}GroupBy`).

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
- **`Tipologie`**: Cross-cutting classifications (`TipologiaVino`, `TipologiaBirra`, `TipologiaLiquore`, `TipologiaCocktail`, `TipologiaBevanda`).
- **`ServiziAccessorio`**: Extra services.

### System
- **`Users`**: RBAC (Admin/User).
- **`Media`**: Image uploads (GCS) — media generici del sito (futuro).
- **`MediaRistorante`**: Image uploads (GCS) dedicati al menu ristorante (logo, icone sezioni). Slug: `media-ristorante`. Group: `Ristorante impostazioni`.

### Globals
- **`generali`** (`Ristorante impostazioni`): Orari settimanali, fasce pranzo/cena, chiusure e festività.
- **`menu-config`** (`Ristorante configurazione`): Struttura e visibilità del menu (sezioni, filtri per categoria, visibilità per fascia oraria). Include branding (logo in sidebar, annotazione) e titolo del menu.
- **`ordinamento-menu`** (`Ristorante configurazione`): Ordine visuale delle categorie/tipologie (manuale, drag & drop) e regole di sort/grouping automatico degli item per ogni sezione del menu.

## 🌐 Globals

### `menu-config` — Struttura e Visibilità del Menu

**File**: `src/globals/MenuConfig.ts`
**Slug**: `menu-config`
**Tipo**: Global (Payload GlobalConfig)
**Group**: `Ristorante configurazione`
**Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`
**Versions/Drafts**: ✅ Abilitato (`versions: { drafts: true }`) — espone il campo `_status` (`draft` / `published`), necessario per la logica di accesso pubblico in `menuImpostazioniReadAccess`.

Questo Global definisce **quali sezioni mostrare nel frontend** e con quali regole di visibilità. Non contiene i dati dei piatti/vini (che vivono nelle rispettive collections), ma la **struttura di presentazione** del menu.

#### Logica di Override

Il frontend deve applicare questa logica per determinare quale array di sezioni usare:

```
1. Leggi menu-config
2. Se specialItems.isActive === true
   E data corrente >= activeRange.start
   E data corrente <= activeRange.end
   → usa specialItems
3. Altrimenti → usa standardItems
```

#### Struttura Dati

**Tab 1: Generale** — campi `title`, `annotazione`

**Tab 2: Menu Standard (Default)** — campo `standardItems` (Array)

**Tab 3: Menu Speciale (Override)** — campo `specialItems` (Array, condizionale)

**Sidebar (root, visibile su tutte le tab)** — `logo`, `isActive`, `activeRange`

> **Nota tecnica**: In Payload CMS v3, `admin: { position: 'sidebar' }` funziona **solo per campi definiti al root del global**, fuori dall'array `tabs`. Campi con `position: 'sidebar'` annidati dentro un tab vengono ignorati e renderizzati nell'area principale. Per questo motivo `logo`, `isActive` e `activeRange` sono definiti come campi root dopo il campo `tabs`.

```typescript
// Struttura del documento menu-config
{
  // Tab Generale
  title?: string,                                    // testo — titolo del menu digitale
  annotazione?: SerializedEditorState,               // richText Lexical (bold/italic/underline/list/link)

  // Tab Menu Standard
  standardItems: MenuItemArray,

  // Tab Menu Speciale
  specialItems: MenuItemArray,                       // visibile nell'admin solo se isActive === true

  // Sidebar root (visibili su tutte le tab)
  logo?: { id: number, url: string, alt: string },   // upload → media-ristorante
  isActive: boolean,
  activeRange: {
    start: string,   // ISO date
    end: string,     // ISO date
  },
}
```

#### Struttura "Item Menu" (MenuItemArray)

Sia `standardItems` che `specialItems` sono array di oggetti con questa struttura:

```typescript
{
  label: string,
  sourceCollection: Array<'piatti' | 'vini' | 'birre' | 'liquori' | 'cocktail' | 'bevande' | 'servizi-accessori' | 'menu-fisso'>,
  filterMode?: 'all' | 'include' | 'exclude',   // visibile solo se sourceCollection.length === 1
  targetCategories?: PolymorphicRelation[],      // visibile solo se filterMode != 'all' e sorgente singola
  visibility: 'always' | 'lunch_only' | 'dinner_only',
  activeDays?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>,
  icona?: { id: number, url: string, alt: string },  // upload → media-ristorante (opzionale)
}
```

#### Logica `sourceCollection` — Multi-selezione

Il campo accetta **una o più** collections. Quando sono selezionate più sorgenti, il frontend le unisce in un'unica lista di elementi. In questo caso `filterMode` e `targetCategories` sono **nascosti nell'admin** e ignorati dal frontend (comportamento equivalente a `filterMode: 'all'`).

#### Logica `filterMode`

Disponibile **solo con una singola sorgente dati**.

| Valore | Comportamento |
|--------|---------------|
| `all` | Mostra tutti gli elementi della `sourceCollection` |
| `include` | Mostra solo gli elementi con categoria/tipologia in `targetCategories` |
| `exclude` | Mostra tutti gli elementi TRANNE quelli con categoria/tipologia in `targetCategories` |

#### `targetCategories` — Relationship Polimorfica con Filtro Dinamico

Il campo usa `relationTo` come array (relationship polimorfica Payload). Ogni elemento ha la forma:

```typescript
{ relationTo: string, value: number | string }
// es. { relationTo: 'tipologie-vino', value: 3 }
```

**Mappa sorgente → collection di riferimento corretta:**

| `sourceCollection` | Collection da selezionare in `targetCategories` |
|--------------------|--------------------------------------------------|
| `piatti` | `categoria-piatti` |
| `vini` | `tipologie-vino` |
| `birre` | `tipologie-birra` |
| `liquori` | `tipologie-liquore` |
| `cocktail` | `tipologie-cocktail` |
| `bevande` | `tipologie-bevanda` |
| `menu-fisso` | `categoria-menu-fisso` |
| `servizi-accessori` | — (nessuna categoria disponibile) |

**Filtro dinamico nell'admin (UX)**: il campo usa `filterOptions` come funzione che riceve `{ relationTo, siblingData }`. In base al valore di `sourceCollection` nel sibling data, restituisce `true` solo per la collection corrispondente e `false` per tutte le altre. Questo fa sì che il dropdown mostri **solo le categorie/tipologie pertinenti** alla sorgente selezionata.

```typescript
filterOptions: ({ relationTo, siblingData }) => {
  const sourceToRelation = { piatti: 'categoria-piatti', vini: 'tipologie-vino', ... }
  const src = siblingData?.sourceCollection
  const selectedSource = Array.isArray(src) ? src[0] : src
  const expectedRelation = sourceToRelation[selectedSource]
  return relationTo === expectedRelation ? true : false
}
```

> **Nota per il frontend**: il campo è polimorfico, quindi ogni elemento di `targetCategories` include `relationTo` per discriminare il tipo. Filtra solo gli elementi la cui `relationTo` corrisponde alla `sourceCollection` attiva.

> **Nota per gli agenti AI**: il filtro dinamico è implementato tramite `filterOptions` nativo di Payload (non un componente custom). Funziona sia per la validazione lato server che per il rendering del dropdown nell'admin. Non è necessario un componente React custom per questa funzionalità.

#### Logica `activeDays` — Filtro per Giorno della Settimana

Il campo `activeDays` è un array opzionale di giorni della settimana (valori in inglese lowercase, coerenti con `generali.scheduleWeekly`).

| Valore campo | Comportamento Frontend |
|---|---|
| `undefined` / `null` / `[]` | Sezione visibile **tutti i giorni** (retrocompatibilità) |
| Array con uno o più giorni | Visibile **solo** nei giorni elencati |

#### Logica `visibility` — Collegamento con `generali`

I valori di `visibility` sono **chiavi logiche** che il frontend mappa sugli orari reali del Global `generali`:

| Valore | Comportamento Frontend |
|--------|------------------------|
| `always` | Sezione sempre visibile (nella fascia oraria) |
| `lunch_only` | Visibile solo se `orarioCorrente` è compreso in `generali.lunchSlot` |
| `dinner_only` | Visibile solo se `orarioCorrente` è compreso in `generali.dinnerSlot` |

**Algoritmo frontend completo per la visibilità di una sezione** (`activeDays` + `visibility`):

```
1. Ottieni giorno corrente (es. 'monday') e ora corrente
2. Leggi generali.lunchSlot e generali.dinnerSlot
3. Per ogni item nel menu attivo (standard o speciale):

   STEP A — Verifica giorni (activeDays):
   - Se item.activeDays è definito E non vuoto
     E il giorno corrente NON è in item.activeDays → NASCONDI (salta al prossimo item)
   - Altrimenti (vuoto/null/undefined) → prosegui

   STEP B — Verifica fascia oraria (visibility):
   - Se item.visibility === 'always' → MOSTRA
   - Se item.visibility === 'lunch_only':
       MOSTRA se orarioCorrente >= lunchSlot.start && orarioCorrente <= lunchSlot.end
   - Se item.visibility === 'dinner_only':
       MOSTRA se orarioCorrente >= dinnerSlot.start && orarioCorrente <= dinnerSlot.end
```

> **Nota**: I due filtri sono indipendenti e si applicano in sequenza. Un item con `activeDays: ['saturday', 'sunday']` e `visibility: 'lunch_only'` sarà visibile solo il sabato e la domenica durante la fascia pranzo.

#### API REST

```bash
# Lettura (pubblica/autenticata)
GET /api/globals/menu-config

# Aggiornamento (solo admin)
POST /api/globals/menu-config
```

#### Componenti UI Personalizzati

**`MenuItemRowLabel`** — `src/components/MenuItemRowLabel.tsx`

Componente React Client (`'use client'`) che personalizza l'etichetta di ogni riga negli array `standardItems` e `specialItems` nell'admin panel. Usa l'hook `useRowLabel` di Payload.

- Se il campo `label` (Titolo Sezione) ha un valore → mostra il titolo direttamente nella riga collassata
- Fallback: "Sezione 01", "Sezione 02", ecc. per item senza titolo

```typescript
// Collegato in MenuConfig.ts tramite:
admin: {
  components: {
    RowLabel: '@/components/MenuItemRowLabel',
  },
}
```

Registrato in `src/app/(payload)/admin/importMap.js` con la chiave `"@/components/MenuItemRowLabel#default"`.

#### Note per gli Agenti AI

- **`targetCategories`** punta alla collection `categoria-piatti` (slug: `categoria-piatti`), non a una collection generica `categories`.
- **`sourceCollection`** usa i slug reali del progetto: `piatti`, `vini`, `birre`, `liquori`, `cocktail`, `bevande`, `servizi-accessori`, `menu-fisso` (non `dishes`/`wines`).
- Il campo `activeRange` e `specialItems` sono **condizionali**: visibili nell'admin solo se `isActive === true`.
- Non ci sono hooks o webhooks su questo Global (la configurazione del menu non richiede rebuild immediati).
- Il componente `MenuItemRowLabel` è condiviso tra `standardItems` e `specialItems` — legge sempre il campo `label` del sibling data.
- Il campo `logo` e il campo `icona` puntano entrambi alla collection `media-ristorante` (NON a `media`).
- Il campo `annotazione` usa un editor Lexical con toolbar fissa e queste feature: `BoldFeature`, `ItalicFeature`, `UnderlineFeature`, `UnorderedListFeature`, `LinkFeature`. Non supporta heading, immagini inline o altri elementi avanzati.
- Le tab sono 3: **Generale** (Tab 1), **Menu Standard** (Tab 2), **Menu Speciale** (Tab 3).
- **UX Sidebar**: `logo`, `isActive` e `activeRange` sono definiti come campi **root** (fuori dal campo `tabs`) con `admin: { position: 'sidebar' }` — appaiono nella colonna destra dell'editor Payload su tutte le tab. In Payload v3, `position: 'sidebar'` funziona solo a livello root, non dentro un tab annidato.
- Il campo `title` (Tab 1) è un campo `text` opzionale che rappresenta il titolo del menu digitale mostrato nel frontend.

---

### `ordinamento-menu` — Ordine Visuale e Regole di Sort/Grouping

**File**: `src/globals/OrdinamentoMenu.ts`
**Slug**: `ordinamento-menu`
**Tipo**: Global (Payload GlobalConfig)
**Group**: `Ristorante configurazione`
**Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`
**Versions/Drafts**: ✅ Abilitato (`versions: { drafts: true }`) — obbligatorio perché `menuImpostazioniReadAccess` filtra per `_status`; senza drafts Payload crasha con `Cannot find field for path at _status`.

Questo Global definisce **due livelli di configurazione** per il frontend:

1. **Ordine manuale delle categorie/tipologie**: campi `relationship` con `hasMany: true` che l'editor ordina tramite drag & drop nell'admin UI. La sequenza dell'array determina l'ordine di visualizzazione nel menu.
2. **Regole automatiche di sort e grouping**: campi `select` che indicano al frontend con quale criterio ordinare gli item e se raggrupparli in sottosezioni.

#### Struttura per Tab

| Tab | Campo Relationship | `orderBy` default | `groupBy` default |
|---|---|---|---|
| Piatti | `categoriePiatti` → `categoria-piatti` | `order` | `nessuno` |
| Vini | `tipologieVino` → `tipologie-vino` | `order` | `regione` |
| Liquori | `tipologieLiquore` → `tipologie-liquore` | `order` | `nazione` |
| Birre | `tipologieBirra` → `tipologie-birra` | `order` | `nessuno` |
| Cocktail | `tipologieCocktail` → `tipologie-cocktail` | `order` | `nessuno` |
| Bevande | `tipologieBevanda` → `tipologie-bevanda` | `order` | `nessuno` |

I nomi dei campi `select` seguono il pattern `{sezione}OrderBy`, `{sezione}OrderDirection`, `{sezione}GroupBy` (es. `piattiOrderBy`, `viniGroupBy`).

#### Tabelle DB Generate

- `ordinamento_menu` — tabella principale con tutti i campi select
- `ordinamento_menu_rels` — tabella di join per le relationship `hasMany` (campo `order` per preservare la sequenza drag & drop)

#### Integrazione Frontend

Il frontend deve:
1. Leggere `GET /api/globals/ordinamento-menu` all'avvio.
2. Per ogni sezione, usare il campo relationship corrispondente per determinare l'ordine delle categorie/tipologie da mostrare.
3. Usare `{sezione}OrderBy` e `{sezione}OrderDirection` come parametri `sort` nelle query agli item.
4. Se `{sezione}GroupBy !== 'nessuno'`, raggruppare gli item per il campo indicato prima di renderizzarli.

```typescript
// Esempio: come il frontend usa questo global per i vini
const ordinamento = await fetch('/api/globals/ordinamento-menu').then(r => r.json())

// 1. Ordine tipologie
const tipologieOrdinate = ordinamento.tipologieVino // array già ordinato

// 2. Query vini con sort dal global
const sortField = ordinamento.viniOrderBy      // es. 'order'
const sortDir = ordinamento.viniOrderDirection  // es. 'asc'
const vini = await fetch(`/api/vino?sort=${sortDir === 'desc' ? '-' : ''}${sortField}`)

// 3. Raggruppamento
const groupField = ordinamento.viniGroupBy  // es. 'regione'
if (groupField !== 'nessuno') {
  // raggruppa vini per il campo `groupField`
}
```

---

### `generali` — Single Source of Truth per Orari e Aperture

**File**: `src/globals/Generali.ts`
**Slug**: `generali`
**Tipo**: Global (Payload GlobalConfig)
**Group**: `Ristorante impostazioni`
**Access**: `menuImpostazioniReadAccess` / `menuImpostazioniUpdateAccess`
**Versions/Drafts**: ✅ Abilitato (`versions: { drafts: true }`) — espone il campo `_status` (`draft` / `published`), necessario per la logica di accesso pubblico in `menuImpostazioniReadAccess`.

Questo Global è la fonte primaria di verità per tutto ciò che riguarda la gestione del tempo del ristorante. Il frontend deve consultare questo Global per determinare disponibilità e menu da mostrare.

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

**UX Admin**: `scheduleWeekly` usa `ScheduleWeeklyRowLabel` per mostrare il nome del giorno (es. "Lunedì") nella riga collassata. Le fasce orarie in `hours` usano `CambioOrarioRowLabel` per mostrare il range "HH:MM - HH:MM".

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

#### Componenti UI Personalizzati: RowLabel

I componenti RowLabel personalizzano l'etichetta delle righe collassate negli array dell'admin panel. Tutti usano l'hook `useRowLabel<T>()` di `@payloadcms/ui` e seguono lo stesso pattern:

1. Leggi il campo significativo dal `data` dell'item
2. Se presente → mostra quel valore
3. Fallback → etichetta generica con numero progressivo (`rowNumber + 1` con zero-padding)

| Componente | File | Usato in | Campo letto | Fallback |
|---|---|---|---|---|
| `ScheduleWeeklyRowLabel` | `src/components/ScheduleWeeklyRowLabel.tsx` | `generali` → `scheduleWeekly` | `day` (mappato in italiano) | "Nuovo Giorno 01" |
| `CambioOrarioRowLabel` | `src/components/CambioOrarioRowLabel.tsx` | `generali` → `scheduleWeekly[].hours`, `generali` → `exceptions[].variedHours` | `start` + `end` | "Cambio orario 01" |
| `ChiusuraRowLabel` | `src/components/ChiusuraRowLabel.tsx` | `generali` → `exceptions` | `reason` | "Chiusura 01" |
| `MenuItemRowLabel` | `src/components/MenuItemRowLabel.tsx` | `menu-config` → `standardItems`, `specialItems` | `label` | "Sezione 01" |

**Pattern di registrazione in `payload.config.ts` / config della collection o global:**

```typescript
admin: {
  components: {
    RowLabel: '@/components/NomeRowLabel',
  },
}
```

**Tutti i componenti RowLabel sono Client Components** (`'use client'`) e vengono registrati automaticamente nell'`importMap.js` da Payload.

---

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
# Lettura (pubblica/autenticata)
GET /api/globals/generali

# Aggiornamento (solo admin)
POST /api/globals/generali
```

## 🧠 Key Logic Patterns

### Smart Webhook (Traffic Cop — Multi-Frontend)
Located in `src/hooks/smartWebhook.ts`.
- **Fast Path**: Regenerates JSON on GCS for simple availability toggles.
- **Slow Path**: Triggers full rebuilds via Pub/Sub for structural changes.
- **Mock Mode**: Simulates GCP in local dev.
- **Multi-Frontend Architecture**: Each frontend has its own dedicated GCS bucket and receives only the data from its relevant collections, defined in `FRONTEND_TARGETS`.

#### FRONTEND_TARGETS Configuration

The `FRONTEND_TARGETS` array in `smartWebhook.ts` is the single source of truth for multi-frontend routing:

```typescript
type FrontendTarget = {
  id: string          // Target identifier (e.g. 'menu')
  bucketEnv: string   // Name of the env var holding the GCS bucket name
  filename: string    // Output JSON filename in the bucket
  collections: string[] // Collection slugs included in this target's JSON
}
```

#### Active Targets

| Target ID | Env Variable | Output File | Collections |
|---|---|---|---|
| `menu` | `GCS_MENU_BUCKET` | `disponibilita.json` | 16 (all menu + settings) |

#### Routing Logic

When a collection changes, the hook:
1. Calls `getAffectedTargets(collectionSlug)` — filters `FRONTEND_TARGETS` by `target.collections.includes(slug)`
2. For each affected target:
   - **Fast Path**: calls `aggregateDataForTarget(req, target.collections)` then `uploadToGCSTarget(data, target)`
   - **Slow Path**: calls `sendPubSubMessage(collection, docId, changedFields)`
3. If a target's `bucketEnv` variable is missing → logs a warning and **skips gracefully** (does not throw)

#### Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GCP_PROJECT_ID` | ✅ Yes | Google Cloud project ID |
| `GCS_MENU_BUCKET` | ✅ Yes (menu target) | GCS bucket name for the menu frontend |

> **Breaking Change**: `GCS_FRONTEND_BUCKET` has been **replaced** by `GCS_MENU_BUCKET`. Update Cloud Run env vars and `.env.example`.

#### Adding a New Frontend Target

Add an entry to `FRONTEND_TARGETS` in `src/hooks/smartWebhook.ts`:

```typescript
{
  id: 'corporate',
  bucketEnv: 'GCS_CORPORATE_BUCKET',
  filename: 'corporate-data.json',
  collections: ['piatti', 'allergeni'], // Only relevant collections
}
```

No other code changes needed — routing is automatic.

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

### GCS Media Storage (CRITICAL) — Architettura a Doppio Plugin

Le collection upload usano **due plugin `gcsStorage` separati**, uno per bucket:

| Collection | Plugin | Variabile d'ambiente | Bucket |
|---|---|---|---|
| `media` | `gcsPluginMedia` | `GCS_BUCKET` | Media generici del sito |
| `media-ristorante` | `gcsPluginMenuMedia` | `GCS_MENU_BUCKET` | Media dedicati al menu ristorante |

**CRITICAL**: Non usare mai un singolo plugin per entrambe le collection — ogni collection deve puntare al proprio bucket tramite un'istanza separata.

**1. Plugin in `payload.config.ts`** (gestisce il routing degli upload verso GCS):
```typescript
const gcsEnabled = Boolean(process.env.GCS_BUCKET)
const gcsMenuEnabled = Boolean(process.env.GCS_MENU_BUCKET)

// Plugin per Media generici → GCS_BUCKET
const gcsPluginMedia = gcsStorage({
  collections: {
    media: gcsEnabled ? { disableLocalStorage: true } : true,
  },
  bucket: process.env.GCS_BUCKET || 'not-configured',
  options: {
    ...(process.env.GCP_PROJECT_ID && { projectId: process.env.GCP_PROJECT_ID }),
  },
  enabled: gcsEnabled,
})

// Plugin per MediaRistorante → GCS_MENU_BUCKET
const gcsPluginMenuMedia = gcsStorage({
  collections: {
    'media-ristorante': gcsMenuEnabled ? { disableLocalStorage: true } : true,
  },
  bucket: process.env.GCS_MENU_BUCKET || 'not-configured',
  options: {
    ...(process.env.GCP_PROJECT_ID && { projectId: process.env.GCP_PROJECT_ID }),
  },
  enabled: gcsMenuEnabled,
})

export default buildConfig({
  plugins: [
    gcsPluginMedia,
    gcsPluginMenuMedia,
    // ...altri plugin
  ],
})
```

**2. `disableLocalStorage` inside the plugin config** (NOT in the collection):
```typescript
// ✅ CORRECT: evaluated at runtime by Node.js
media: gcsEnabled ? { disableLocalStorage: true } : true,

// ❌ WRONG: compiled into the bundle at build time (always false in Docker)
// upload: { disableLocalStorage: Boolean(process.env.GCS_BUCKET) }
```

**3. `afterRead` hook + `adminThumbnail`** — ogni collection usa la propria variabile bucket:

`src/collections/Media.ts` (usa `GCS_BUCKET`):
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

`src/collections/MediaRistorante.ts` (usa `GCS_MENU_BUCKET`):
```typescript
upload: {
  adminThumbnail: ({ doc }) => {
    if (process.env.GCS_MENU_BUCKET && doc.filename)
      return `https://storage.googleapis.com/${process.env.GCS_MENU_BUCKET}/${doc.filename}`
    return null
  },
},
hooks: {
  afterRead: [({ doc }) => {
    if (doc.filename && process.env.GCS_MENU_BUCKET)
      doc.url = `https://storage.googleapis.com/${process.env.GCS_MENU_BUCKET}/${doc.filename}`
    return doc
  }],
},
```

**WHY ALL THREE ARE NEEDED**:
- `disableLocalStorage` in plugin config: prevents writing file to local disk on Cloud Run
- `afterRead` hook: overwrites `doc.url` at every read — works even if the plugin falls back to local URLs (e.g. with Uniform Bucket Level Access active on the bucket, which blocks per-file ACL and causes the plugin to silently fall back to local URLs)
- `adminThumbnail`: ensures Admin Panel previews load from GCS

**CRITICAL - Build-time vs Runtime trap**: `disableLocalStorage` in the collection's `upload` config is compiled into the Next.js bundle during `next build` in Docker (where env vars are undefined → `false`). In the plugin config it's evaluated at runtime by Node.js. Always put it in the plugin config.

**4. GCS Bucket configuration** (verified via Google Cloud Console GUI):

Three things must be set on **each** bucket (`Cloud Storage → Bucket → [name]`):

| Tab | Setting | Required value | Effect if wrong |
|---|---|---|---|
| Permissions | `allUsers` → `Storage Object Viewer` | Must exist | Every file URL returns `403 Forbidden` |
| Configuration | Access control | `Uniform` (standard) | With `Fine-grained`, plugin tries per-file ACL (deprecated) |
| Configuration | Public access prevention | `Not enforced` | If `Enforced`, blocks `allUsers` even if added → files never public |

**Verification**: At startup, check Cloud Run logs for:
```
[GCS Storage] GCS_BUCKET: <bucket-name>
[GCS Storage] GCS_MENU_BUCKET: <menu-bucket-name>
[GCS Storage] Plugin media abilitato: true
[GCS Storage] Plugin media-ristorante abilitato: true
```
If you see `(non impostato)` or `false`, env vars are missing in Cloud Run service configuration.

**Required environment variables**:

| Variable | Required | Description |
|---|---|---|
| `GCS_BUCKET` | ✅ Yes (media) | GCS bucket for generic site media |
| `GCS_MENU_BUCKET` | ✅ Yes (media-ristorante) | GCS bucket for restaurant menu media |
| `GCP_PROJECT_ID` | ✅ Yes | Google Cloud project ID (shared by both plugins) |

---

**Root cause summary** (confirmed in production): The most common reason uploads go to `/api/media/file/` instead of GCS is a combination of:
1. `disableLocalStorage` placed in the collection instead of the plugin config (build-time vs runtime compilation)
2. Missing `allUsers:objectViewer` on the bucket (files reach GCS but URLs return 403)
3. `afterRead` hook missing (no fallback URL override when plugin fails silently with Uniform Bucket Level Access)
4. Wrong bucket variable used in `afterRead`/`adminThumbnail` (e.g. `GCS_BUCKET` instead of `GCS_MENU_BUCKET` in `MediaRistorante`)

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

## UX Standards

### Rich Text Editor (Lexical)

Per i campi `richText` con editor Lexical, seguire queste regole:

1. **Privilegiare sempre la Fixed Toolbar** con icone esplicite rispetto ai soli comandi slash (`/`). La toolbar fissa è il comportamento di default di Lexical — non disabilitarla.

2. **Set minimo di feature standard** da includere salvo restrizioni specifiche:
   ```typescript
   editor: lexicalEditor({
     features: [
       FixedToolbarFeature(),   // toolbar fissa sempre visibile con icone
       BoldFeature(),
       ItalicFeature(),
       UnderlineFeature(),
       UnorderedListFeature(),
       LinkFeature({}),
     ],
   })
   ```

3. **Deroghe accettabili**: ridurre il set solo se il campo ha vincoli editoriali espliciti (es. un campo note tecnico dove i link non hanno senso, o un campo tag dove la formattazione è indesiderata). Documentare sempre il motivo della restrizione nel campo `admin.description`.

4. **Import**: tutte le feature si importano da `@payloadcms/richtext-lexical`:
   ```typescript
   import {
     lexicalEditor,
     FixedToolbarFeature,
     BoldFeature,
     ItalicFeature,
     UnderlineFeature,
     UnorderedListFeature,
     LinkFeature,
     // OrderedListFeature, HeadingFeature, BlockquoteFeature, ecc.
   } from '@payloadcms/richtext-lexical'
   ```

### Sidebar nei Global/Collection con Tabs

In Payload CMS v3, `admin: { position: 'sidebar' }` funziona **solo per campi definiti al root** del global/collection, fuori dall'array `tabs`. Campi con `position: 'sidebar'` annidati dentro un tab vengono ignorati e renderizzati nell'area principale.

**Pattern corretto**:
```typescript
fields: [
  { type: 'tabs', tabs: [ /* ... tab fields ... */ ] },
  // Campi sidebar DOPO il blocco tabs, al root:
  { name: 'logo', type: 'upload', admin: { position: 'sidebar' } },
  { name: 'isActive', type: 'checkbox', admin: { position: 'sidebar' } },
]
```

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

> ⚠️ **REGOLA CRITICA — `_status` e Drafts**
>
> Le funzioni di accesso `menuImpostazioniReadAccess`, `menuRistoranteReadAccess` e qualsiasi altra funzione che filtra per `_status` (es. `{ _status: { equals: 'published' } }`) richiedono **obbligatoriamente** che la Collection o il Global abbiano `versions: { drafts: true }` abilitato.
>
> **Senza drafts, Payload crasha** con errore `Cannot find field for path at _status` al momento della lettura.
>
> Regola: se usi una funzione di accesso che restituisce un filtro su `_status`, **devi** aggiungere `versions: { drafts: true }` alla configurazione.
>
> ```typescript
> // ✅ CORRETTO
> export const MyGlobal: GlobalConfig = {
>   access: { read: menuImpostazioniReadAccess },
>   versions: { drafts: true },  // obbligatorio se read filtra per _status
>   fields: [...],
> }
>
> // ❌ SBAGLIATO — causa crash 500
> export const MyGlobal: GlobalConfig = {
>   access: { read: menuImpostazioniReadAccess },
>   // versions mancante → Cannot find field for path at _status
>   fields: [...],
> }
> ```

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
