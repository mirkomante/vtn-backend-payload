# API Reference

Documentazione completa delle API REST e GraphQL del backend Payload CMS.

## 📋 Indice

- [Panoramica](#panoramica)
- [Autenticazione](#autenticazione)
- [Endpoints Base](#endpoints-base)
- [Collections API](#collections-api)
  - [Piatti](#piatti)
  - [Menu Fissi](#menu-fissi)
  - [Vini](#vini)
  - [Birre](#birre)
  - [Cocktail](#cocktail)
  - [Categorie](#categorie)
  - [Allergeni](#allergeni)
  - [Media](#media)
  - [Media Ristorante](#media-ristorante)
- [Globals API](#globals-api)
  - [menu-config](#menu-config)
  - [ordinamento-menu](#ordinamento-menu)
- [Querying](#querying)
- [GraphQL](#graphql)
- [Webhook & Events](#webhook--events)

---

## Panoramica

### Base URL

- **Locale**: `http://localhost:3000`
- **Produzione**: `https://your-domain.com`

### Endpoints Principali

| Endpoint | Descrizione |
|----------|-------------|
| `/api/*` | REST API |
| `/api/graphql` | GraphQL Endpoint |
| `/api/graphql-playground` | GraphQL Playground (dev only) |
| `/admin` | Admin Panel UI |

### Formato Risposte

Tutte le risposte API sono in formato JSON:

```json
{
  "docs": [...],
  "totalDocs": 100,
  "limit": 10,
  "totalPages": 10,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

---

## Autenticazione

### Google OAuth 2.0

**Endpoint di autorizzazione**:
```
GET /api/users/oauth/google/authorize
```

**Callback**:
```
GET /api/users/oauth/google/callback
```

### JWT Authentication

Dopo il login, il JWT viene salvato in un cookie HTTP-only:

```
Set-Cookie: payload-token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
```

### Header Autenticazione

Per richieste API autenticate:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain.com/api/piatti
```

O usa il cookie:

```bash
curl -b "payload-token=YOUR_JWT_TOKEN" \
  https://your-domain.com/api/piatti
```

### Ruoli e Permessi

| Ruolo | Descrizione | Permessi |
|-------|-------------|----------|
| `admin` | Amministratore | Lettura/scrittura completa |
| `user` | Utente base | Solo lettura contenuti pubblicati |

---

## Endpoints Base

### Healthcheck

```bash
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T12:00:00.000Z"
}
```

### Collections List

```bash
GET /api
```

**Response**:
```json
{
  "collections": [
    { "slug": "piatti", "label": "Piatti" },
    { "slug": "menu-fisso", "label": "Menù Fissi" },
    // ...
  ]
}
```

---

## Collections API

Tutte le collections seguono lo stesso pattern REST:

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/{collection}` | Lista documenti (con paginazione) |
| `GET` | `/api/{collection}/:id` | Dettaglio singolo documento |
| `POST` | `/api/{collection}` | Crea nuovo documento |
| `PATCH` | `/api/{collection}/:id` | Aggiorna documento |
| `DELETE` | `/api/{collection}/:id` | Elimina documento |

---

### Piatti

**Slug**: `piatti`  
**Endpoint**: `/api/piatti`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome del piatto | ✅ |
| `descrizione` | `string` | Descrizione del piatto | ❌ |
| `prezzo` | `number` | Prezzo (max 10 cifre, 2 decimali) | ✅ |
| `inLista` | `boolean` | Visibile nel menu pubblico | ✅ (default: `true`) |
| `soloMenuFissi` | `boolean` | Disponibile solo nei menu fissi | ❌ (default: `false`) |
| `glutenFree` | `boolean` | Senza glutine | ❌ (default: `false`) |
| `noUovo` | `boolean` | Senza uova | ❌ (default: `false`) |
| `noLatticini` | `boolean` | Senza latticini | ❌ (default: `false`) |
| `vegan` | `boolean` | Vegano | ❌ (default: `false`) |
| `categoria` | `relationship` | Categoria piatto (`categoria-piatti`) | ✅ |
| `allergeni` | `relationship[]` | Lista allergeni | ❌ |

> **Nota ordinamento**: L'ordinamento dei piatti è definito nel Global `ordinamento-menu` (`piattiOrderBy` + `piattiOrderDirection`). Il frontend deve leggere quel global per costruire il parametro `sort` corretto. Il `defaultSort` della collection è `updatedAt`.

#### Esempi

**Lista piatti pubblicati e visibili**:

```bash
GET /api/piatti?where[_status][equals]=published&where[inLista][equals]=true&limit=20
```

**Piatti senza glutine**:

```bash
GET /api/piatti?where[glutenFree][equals]=true
```

**Piatti di una categoria specifica**:

```bash
GET /api/piatti?where[categoria][equals]=CATEGORIA_ID
```

**Crea nuovo piatto** (admin only):

```bash
POST /api/piatti
Content-Type: application/json

{
  "nome": "Carbonara",
  "descrizione": "Pasta alla carbonara tradizionale",
  "prezzo": 12.50,
  "inLista": true,
  "glutenFree": false,
  "categoria": "CATEGORIA_ID",
  "allergeni": ["ALLERGENE_ID_1", "ALLERGENE_ID_2"]
}
```

**Response**:
```json
{
  "doc": {
    "id": "abc123",
    "nome": "Carbonara",
    "prezzo": 12.50,
    "_status": "draft",
    "createdAt": "2026-02-08T12:00:00.000Z",
    "updatedAt": "2026-02-08T12:00:00.000Z"
  }
}
```

---

### Menu Fissi

**Slug**: `menu-fisso`  
**Endpoint**: `/api/menu-fisso`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome del menu | ✅ |
| `descrizione` | `string` | Descrizione del menu | ❌ |
| `prezzo` | `number` | Prezzo totale | ✅ |
| `inLista` | `boolean` | Visibile nel menu pubblico | ✅ (default: `true`) |
| `categoria` | `relationship` | Categoria menu (`categoria-menu-fisso`) | ✅ |
| `piatti` | `relationship[]` | Piatti inclusi | ❌ |
| `servizi` | `relationship[]` | Servizi accessori inclusi | ❌ |

#### Esempi

**Lista menu pubblicati**:

```bash
GET /api/menu-fisso?where[_status][equals]=published&where[inLista][equals]=true&depth=2
```

**Menu con piatti popolati**:

```bash
GET /api/menu-fisso/MENU_ID?depth=2
```

**Response**:
```json
{
  "id": "menu123",
  "nome": "Menu Degustazione",
  "prezzo": 45.00,
  "piatti": [
    {
      "id": "piatto1",
      "nome": "Antipasto",
      "prezzo": 10.00
    },
    {
      "id": "piatto2",
      "nome": "Primo",
      "prezzo": 15.00
    }
  ],
  "categoria": {
    "id": "cat1",
    "nome": "Degustazione"
  }
}
```

---

### Vini

**Slug**: `vini`  
**Endpoint**: `/api/vini`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome del vino | ✅ |
| `descrizione` | `string` | Descrizione del vino | ❌ |
| `prezzo` | `number` | Prezzo bottiglia | ✅ |
| `prezzoCalice` | `number` | Prezzo al calice | ❌ |
| `inLista` | `boolean` | Visibile nella carta vini | ✅ (default: `true`) |
| `tipologia` | `relationship` | Tipologia vino (`tipologie-vino`) | ✅ |
| `cantina` | `string` | Nome cantina produttrice | ❌ |
| `anno` | `string` | Anno di produzione (es. "2020", "NV") | ❌ |
| `grado` | `string` | Grado alcolico (es. "13.5%") | ❌ |
| `capacita` | `string` | Capacità bottiglia (es. "750ml") | ❌ |
| `certificazione` | `string` | Certificazione (es. DOC, DOCG, IGT) | ❌ |
| `nazione` | `relationship` | Nazione di produzione (`nazioni`) | ✅ |
| `regione` | `relationship` | Regione di produzione (`regioni`) | ❌ |
| `zona` | `relationship` | Zona di produzione (`zone`) | ❌ |

#### Esempi

**Vini pubblicati**:

```bash
GET /api/vino?where[_status][equals]=published&where[inLista][equals]=true&depth=1
```

**Vini per fascia di prezzo**:

```bash
GET /api/vino?where[prezzo][greater_than]=20&where[prezzo][less_than]=50
```

---

### Birre

**Slug**: `birre`  
**Endpoint**: `/api/birre`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome della birra | ✅ |
| `descrizione` | `string` | Descrizione | ❌ |
| `prezzo` | `number` | Prezzo | ✅ |
| `inLista` | `boolean` | Visibile | ✅ (default: `true`) |
| `tipologia` | `relationship` | Tipologia birra (`tipologie-birra`) | ✅ |
| `grado` | `string` | Grado alcolico (es. "5.2%") | ❌ |
| `capacita` | `string` | Capacità (es. "33cl", "50cl") | ❌ |
| `nazione` | `relationship` | Nazione di origine (`nazioni`) | ✅ |

---

### Cocktail

**Slug**: `cocktail`  
**Endpoint**: `/api/cocktail`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome cocktail | ✅ |
| `descrizione` | `string` | Descrizione | ❌ |
| `prezzo` | `number` | Prezzo | ✅ |
| `inLista` | `boolean` | Visibile | ✅ (default: `true`) |
| `tipologia` | `relationship` | Tipologia cocktail (`tipologie-cocktail`) | ✅ |
| `nazione` | `relationship` | Nazione di origine (`nazioni`) | ❌ (opzionale) |

---

### Categorie

#### Categoria Piatti

**Slug**: `categoria-piatti`  
**Endpoint**: `/api/categoria-piatti`

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome della categoria | ✅ |
| `descrizione` | `string` | Descrizione opzionale | ❌ |
| `inLista` | `boolean` | Visibile nel menu pubblico | ✅ (default: `true`) |

```bash
GET /api/categoria-piatti?where[_status][equals]=published
```

#### Categoria Menu Fisso

**Slug**: `categoria-menu-fisso`  
**Endpoint**: `/api/categoria-menu-fisso`

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `nome` | `string` | Nome della categoria | ✅ |
| `descrizione` | `string` | Descrizione opzionale | ❌ |
| `inLista` | `boolean` | Visibile nel menu | ✅ (default: `true`) |

```bash
GET /api/categoria-menu-fisso?where[_status][equals]=published
```

---

### Allergeni

**Slug**: `allergeni`  
**Endpoint**: `/api/allergeni`

#### Schema

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `nome` | `string` | Nome allergene (es. "Glutine") |
| `codice` | `string` | Codice allergene (es. "1") |
| `icona` | `upload` | Icona dell'allergene |

#### Esempi

**Lista allergeni**:

```bash
GET /api/allergeni?sort=codice
```

**Response**:
```json
{
  "docs": [
    {
      "id": "all1",
      "nome": "Glutine",
      "codice": "1",
      "icona": {
        "url": "https://storage.googleapis.com/.../glutine.png"
      }
    }
  ]
}
```

---

### Media

**Slug**: `media`  
**Endpoint**: `/api/media`

Media generici del sito (futuro). Attualmente usato come collection di upload generica di Payload.

#### Upload Media

```bash
POST /api/media
Content-Type: multipart/form-data

file: [binary data]
alt: "Descrizione immagine"
```

**Response**:
```json
{
  "doc": {
    "id": "media123",
    "filename": "carbonara.jpg",
    "mimeType": "image/jpeg",
    "filesize": 245678,
    "width": 1920,
    "height": 1080,
    "url": "https://storage.googleapis.com/your-bucket/carbonara.jpg",
    "alt": "Pasta alla carbonara"
  }
}
```

#### Get Media

```bash
GET /api/media/MEDIA_ID
```

---

### Media Ristorante

**Slug**: `media-ristorante`  
**Endpoint**: `/api/media-ristorante`  
**Group**: `Ristorante impostazioni`  
**Access**: lettura pubblica, scrittura/eliminazione solo admin

Collection di upload dedicata alle immagini del menu ristorante. Separata da `media` per isolamento dei permessi e separazione semantica. Usata da:
- `menu-config` → Tab "Identità" → campo `logo`
- `menu-config` → `standardItems[].icona` e `specialItems[].icona`

#### Schema

| Campo | Tipo | Descrizione | Required |
|-------|------|-------------|----------|
| `alt` | `string` | Testo alternativo per accessibilità | ✅ |
| `filename` | `string` | Nome file (auto-generato) | — |
| `url` | `string` | URL pubblico GCS (auto-generato) | — |
| `mimeType` | `string` | Tipo MIME del file | — |
| `filesize` | `number` | Dimensione in byte | — |
| `width` | `number` | Larghezza in pixel (se immagine) | — |
| `height` | `number` | Altezza in pixel (se immagine) | — |

#### Upload Media Ristorante

```bash
POST /api/media-ristorante
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

file: [binary data]
alt: "Logo del ristorante"
```

**Response**:
```json
{
  "doc": {
    "id": "mr123",
    "filename": "logo-ristorante.png",
    "mimeType": "image/png",
    "filesize": 45678,
    "width": 400,
    "height": 200,
    "url": "https://storage.googleapis.com/your-bucket/logo-ristorante.png",
    "alt": "Logo del ristorante"
  }
}
```

#### Get Media Ristorante

```bash
GET /api/media-ristorante/MEDIA_ID
```

---

## Globals API

I Globals sono documenti singleton — esiste una sola istanza per ciascuno. L'endpoint è:

```
GET /api/globals/{slug}
```

Nessuna paginazione, nessun `docs[]`: la risposta è direttamente l'oggetto documento.

> **Access**: lettura pubblica (utenti non autenticati vedono solo la versione `published`), scrittura solo admin.

---

### `menu-config`

**Endpoint**: `GET /api/globals/menu-config`
**Scopo**: Struttura e visibilità del menu — quali sezioni mostrare, con quale titolo, logo e regole di visibilità per fascia oraria.

#### Logica di override (CRITICA per il frontend)

```
1. Leggi menu-config
2. Se specialItems.isActive === true
   E data corrente >= activeRange.start
   E data corrente <= activeRange.end
   → usa specialItems come lista sezioni
3. Altrimenti → usa standardItems
```

#### Schema risposta

```typescript
{
  id: number,
  title?: string,                  // Titolo del menu digitale
  annotazione?: object,            // RichText Lexical (bold/italic/underline/list/link)
  logo?: {                         // Upload → media-ristorante
    id: number,
    url: string,
    alt: string,
    width: number,
    height: number,
  },
  standardItems: MenuSection[],    // Sezioni sempre attive
  specialItems: MenuSection[],     // Sezioni override (periodo speciale)
  isActive: boolean,               // Se il menu speciale è attivo
  activeRange: {
    start: string,                 // ISO date
    end: string,                   // ISO date
  },
  updatedAt: string,
  createdAt: string,
}

// MenuSection
{
  id: string,
  label: string,                   // Titolo sezione (es. "I Nostri Primi")
  sourceCollection: string[],      // es. ['piatti'], ['vini'], ['menu-fisso']
  visibilita: 'always' | 'lunch_only' | 'dinner_only',
  categoriaFilter?: { id, nome },  // Filtra per categoria specifica (opzionale)
  icona?: { id, url, alt },        // Icona sezione (opzionale)
}
```

#### Esempio

```bash
GET /api/globals/menu-config?depth=1
```

```json
{
  "id": 1,
  "title": "Il Nostro Menu",
  "isActive": false,
  "standardItems": [
    {
      "id": "abc1",
      "label": "Antipasti",
      "sourceCollection": ["piatti"],
      "visibilita": "always",
      "categoriaFilter": { "id": 3, "nome": "Antipasti" }
    },
    {
      "id": "abc2",
      "label": "Carta Vini",
      "sourceCollection": ["vini"],
      "visibilita": "always"
    }
  ],
  "specialItems": [],
  "activeRange": { "start": null, "end": null }
}
```

---

### `ordinamento-menu`

**Endpoint**: `GET /api/globals/ordinamento-menu`
**Scopo**: Definisce l'ordine visuale delle categorie/tipologie (drag & drop editoriale) e le regole di sort/grouping automatico degli item per ogni sezione del menu.

Il frontend **deve leggere questo global** per sapere:
1. In quale sequenza mostrare le categorie/tipologie (array relationship ordinato).
2. Con quale criterio ordinare gli item dentro ogni sezione (`orderBy` + `orderDirection`).
3. Se raggruppare gli item in sottosezioni (`groupBy`).

#### Schema risposta

```typescript
{
  id: number,

  // ── Piatti ──────────────────────────────────────────────────────────────
  categoriePiatti: CategoriaPiatti[],          // Ordine editoriale categorie
  piattiOrderBy: 'order' | 'nome' | 'prezzo' | 'createdAt',
  piattiOrderDirection: 'asc' | 'desc',
  piattiGroupBy: 'nessuno' | 'sottocategoria',

  // ── Vini ─────────────────────────────────────────────────────────────────
  tipologieVino: TipologiaVino[],              // Ordine editoriale tipologie
  viniOrderBy: 'order' | 'nazione' | 'regione' | 'zona' | 'nome' | 'prezzo' | 'anno',
  viniOrderDirection: 'asc' | 'desc',
  viniGroupBy: 'nessuno' | 'nazione' | 'regione' | 'zona' | 'vitigno',

  // ── Liquori ───────────────────────────────────────────────────────────────
  tipologieLiquore: TipologiaLiquore[],
  liquoriOrderBy: 'order' | 'nazione' | 'nome' | 'prezzo',
  liquoriOrderDirection: 'asc' | 'desc',
  liquoriGroupBy: 'nessuno' | 'nazione',

  // ── Birre ─────────────────────────────────────────────────────────────────
  tipologieBirra: TipologiaBirra[],
  birreOrderBy: 'order' | 'nome' | 'prezzo',
  birreOrderDirection: 'asc' | 'desc',
  birreGroupBy: 'nessuno' | 'tipologia' | 'nazione',

  // ── Cocktail ──────────────────────────────────────────────────────────────
  tipologieCocktail: TipologiaCocktail[],
  cocktailOrderBy: 'order' | 'nome' | 'prezzo',
  cocktailOrderDirection: 'asc' | 'desc',
  cocktailGroupBy: 'nessuno' | 'tipologia',

  // ── Bevande ───────────────────────────────────────────────────────────────
  tipologieBevanda: TipologiaBevanda[],
  bevandeOrderBy: 'order' | 'nome' | 'prezzo',
  bevandeOrderDirection: 'asc' | 'desc',
  bevandeGroupBy: 'nessuno' | 'tipologia',

  noteOrdinamento?: string,                    // Note interne (ignorare nel frontend)
  updatedAt: string,
  createdAt: string,
}
```

> **Depth**: usa `?depth=1` per ricevere gli oggetti categoria/tipologia popolati (con `id`, `nome`, ecc.) invece dei soli ID numerici.

#### Esempio risposta (depth=1)

```bash
GET /api/globals/ordinamento-menu?depth=1
```

```json
{
  "id": 1,
  "categoriePiatti": [
    { "id": 2, "nome": "Antipasti" },
    { "id": 5, "nome": "Primi" },
    { "id": 3, "nome": "Secondi" }
  ],
  "piattiOrderBy": "order",
  "piattiOrderDirection": "asc",
  "piattiGroupBy": "nessuno",
  "tipologieVino": [
    { "id": 1, "nome": "Vini Rossi" },
    { "id": 2, "nome": "Vini Bianchi" },
    { "id": 3, "nome": "Bollicine" }
  ],
  "viniOrderBy": "order",
  "viniOrderDirection": "asc",
  "viniGroupBy": "regione",
  "tipologieLiquore": [],
  "liquoriOrderBy": "order",
  "liquoriOrderDirection": "asc",
  "liquoriGroupBy": "nazione"
}
```

#### Pattern di utilizzo — Next.js SSG (App Router)

> **⚠️ SSG: URL assoluto obbligatorio**
> Le fetch eseguite a build-time in Server Components / `generateStaticParams` non hanno contesto browser. L'URL relativo `/api/...` non funziona: usare sempre l'URL assoluto del backend (`process.env.NEXT_PUBLIC_API_URL`).

```typescript
// lib/api.ts — helper riutilizzabile
const API_URL = process.env.NEXT_PUBLIC_API_URL // es. 'https://backend.example.com'

export async function getOrdinamentoMenu() {
  const res = await fetch(
    `${API_URL}/api/globals/ordinamento-menu?depth=1`,
    { next: { tags: ['ordinamento-menu'] } }  // tag per revalidazione manuale
  )
  if (!res.ok) throw new Error('Failed to fetch ordinamento-menu')
  return res.json()
}

export async function getPiatti(categoriaId: number, sortParam: string) {
  const res = await fetch(
    `${API_URL}/api/piatti?where[categoria][equals]=${categoriaId}&where[inLista][equals]=true&sort=${sortParam}&depth=1`,
    { next: { tags: ['piatti'] } }
  )
  return res.json()
}
```

```typescript
// app/menu/page.tsx — Server Component (SSG)
import { getOrdinamentoMenu, getPiatti } from '@/lib/api'

export const dynamic = 'force-static'  // SSG esplicito

export default async function MenuPage() {
  // 1. Carica configurazione ordinamento (build-time)
  const ordinamento = await getOrdinamentoMenu()

  // 2. Costruisci sort param (Payload: prefisso '-' per DESC)
  const sortParam = ordinamento.piattiOrderDirection === 'desc'
    ? `-${ordinamento.piattiOrderBy}`
    : ordinamento.piattiOrderBy

  // 3. Categorie già nell'ordine editoriale corretto
  const categorieOrdinate = ordinamento.categoriePiatti  // [{ id, nome }, ...]

  // 4. Carica piatti per ogni categoria (build-time, in parallelo)
  const piattiPerCategoria = await Promise.all(
    categorieOrdinate.map(async (cat) => {
      const { docs } = await getPiatti(cat.id, sortParam)
      return { categoria: cat, piatti: docs }
    })
  )

  // 5. Raggruppamento (se configurato) — senza Object.groupBy (compatibilità)
  const piattiConGruppi = piattiPerCategoria.map(({ categoria, piatti }) => {
    const groupField = ordinamento.piattiGroupBy
    if (groupField === 'nessuno') return { categoria, gruppi: null, piatti }

    const gruppi = piatti.reduce<Record<string, typeof piatti>>((acc, item) => {
      const key = item[groupField] ?? 'Altro'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
    return { categoria, gruppi, piatti: null }
  })

  return <MenuView dati={piattiConGruppi} />
}
```

```typescript
// Stesso pattern per vini (groupBy su campo relationship → depth=2)
const viniSortParam = ordinamento.viniOrderDirection === 'desc'
  ? `-${ordinamento.viniOrderBy}`
  : ordinamento.viniOrderBy

const { docs: vini } = await fetch(
  `${API_URL}/api/vino?where[inLista][equals]=true&sort=${viniSortParam}&depth=2`,
  { next: { tags: ['vini'] } }
).then(r => r.json())

// groupBy 'regione' → item.regione è un oggetto { id, nome } (depth=2)
const groupField = ordinamento.viniGroupBy
const viniPerGruppo = groupField !== 'nessuno'
  ? vini.reduce<Record<string, typeof vini>>((acc, vino) => {
      const key = typeof vino[groupField] === 'object'
        ? vino[groupField]?.nome ?? 'Altro'  // campo relationship
        : vino[groupField] ?? 'Altro'         // campo stringa
      if (!acc[key]) acc[key] = []
      acc[key].push(vino)
      return acc
    }, {})
  : null
```

#### Revalidazione (quando il backend cambia)

Con SSG, le pagine vengono ricostruite solo a build-time o su revalidazione esplicita. Configurare il backend per chiamare `revalidateTag` quando `ordinamento-menu` viene aggiornato:

```typescript
// Nel backend: hook afterChange su OrdinamentoMenu
// oppure: endpoint dedicato chiamato dal webhook

// Nel frontend Next.js — app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tag } = await req.json()
  revalidateTag(tag)  // es. 'ordinamento-menu', 'piatti', 'vini'
  return Response.json({ revalidated: true })
}
```

> **Nota**: `revalidateTag` richiede Next.js App Router. Con Pages Router (`getStaticProps`) usare invece `res.revalidate('/menu')` in un API route dedicato (`/api/revalidate`).

---

## Querying

### Filtri WHERE

**Operators**:

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `equals` | Uguale a | `where[status][equals]=published` |
| `not_equals` | Diverso da | `where[status][not_equals]=draft` |
| `greater_than` | Maggiore di | `where[prezzo][greater_than]=10` |
| `less_than` | Minore di | `where[prezzo][less_than]=50` |
| `contains` | Contiene (case-insensitive) | `where[nome][contains]=pasta` |
| `like` | Tutte le parole presenti | `where[descrizione][like]=carbonara+cremosa` |
| `in` | In array | `where[categoria][in][0]=cat1&where[categoria][in][1]=cat2` |
| `exists` | Campo esiste | `where[immagine][exists]=true` |

### Ordinamento

```bash
GET /api/piatti?sort=-prezzo       # Decrescente per prezzo
GET /api/piatti?sort=nome          # Crescente per nome
GET /api/piatti?sort=-updatedAt    # Più recenti prima (default)
```

> **Ordinamento editoriale**: L'ordinamento degli item nel menu è gestito dal Global `ordinamento-menu`. Il frontend deve leggere `GET /api/globals/ordinamento-menu` per ottenere `{sezione}OrderBy` e `{sezione}OrderDirection` da usare come parametro `sort`. Il `defaultSort` di tutte le collection è `updatedAt` — il campo `order` è stato rimosso.

### Paginazione

```bash
GET /api/piatti?limit=20&page=2
```

### Depth (popolamento relazioni)

```bash
GET /api/menu-fisso?depth=0  # Solo IDs
GET /api/menu-fisso?depth=1  # Relazioni primo livello
GET /api/menu-fisso?depth=2  # Relazioni annidate
```

### Select (campi specifici)

```bash
GET /api/piatti?select=nome,prezzo,categoria
```

### Esempi Complessi

**Piatti vegetariani sotto i 15€**:

```bash
GET /api/piatti?\
  where[noUovo][equals]=true&\
  where[noLatticini][equals]=true&\
  where[prezzo][less_than]=15&\
  where[inLista][equals]=true&\
  sort=prezzo&\
  limit=10
```

**Vini rossi toscani costosi**:

```bash
GET /api/vini?\
  where[categoria][equals]=rosso&\
  where[regione.nome][equals]=Toscana&\
  where[prezzo][greater_than]=50&\
  sort=-prezzo&\
  depth=1
```

---

## GraphQL

### Endpoint

```
POST /api/graphql
```

### Playground

```
GET /api/graphql-playground
```

(Disponibile solo in development)

### Esempi Query

**Lista piatti**:

```graphql
query {
  Piatti(where: { _status: { equals: published } }, limit: 10) {
    docs {
      id
      nome
      prezzo
      descrizione
      categoria {
        nome
      }
      allergeni {
        nome
        codice
      }
    }
    totalDocs
    hasNextPage
  }
}
```

**Dettaglio piatto**:

```graphql
query {
  Piatto(id: "abc123") {
    id
    nome
    descrizione
    prezzo
    glutenFree
    noUovo
    categoria {
      nome
      ordine
    }
  }
}
```

**Mutation - Crea piatto**:

```graphql
mutation {
  createPiatto(
    data: {
      nome: "Amatriciana"
      prezzo: 11.50
      inLista: true
      categoria: "CATEGORIA_ID"
    }
  ) {
    id
    nome
    _status
  }
}
```

---

## Webhook & Events

### Payload Hooks

Il sistema usa hooks per gestire eventi:

**Eventi disponibili**:
- `beforeChange`: Prima di salvare
- `afterChange`: Dopo il salvataggio
- `beforeDelete`: Prima di eliminare
- `afterDelete`: Dopo eliminazione
- `afterRead`: Dopo la lettura

**Esempio di cleanup automatico**:

Quando elimini un piatto, viene automaticamente rimosso da tutti i menu fissi che lo referenziano.

```typescript
// Implementato in src/hooks/cleanupRelationships.ts
hooks: {
  afterDelete: [
    async ({ req, id }) => {
      await req.payload.update({
        collection: 'menu-fisso',
        where: { piatti: { equals: id } },
        data: { piatti: [] }, // Rimuove il riferimento
      })
    },
  ],
}
```

---

## Rate Limiting

**Limiti (produzione)**:
- Autenticato: 1000 req/min
- Non autenticato: 100 req/min

**Headers di risposta**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1644484800
```

---

## Errori

### Codici HTTP

| Codice | Descrizione |
|--------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `422` | Validation Error |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

### Formato Errori

```json
{
  "errors": [
    {
      "message": "This field is required",
      "field": "nome",
      "path": "nome"
    }
  ]
}
```

---

## Testing API

### cURL

```bash
# GET
curl https://your-domain.com/api/piatti?limit=5

# POST (autenticato)
curl -X POST https://your-domain.com/api/piatti \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","prezzo":10,"categoria":"CAT_ID","inLista":true}'

# PATCH
curl -X PATCH https://your-domain.com/api/piatti/PIATTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prezzo":12.50}'

# DELETE
curl -X DELETE https://your-domain.com/api/piatti/PIATTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/TypeScript

```typescript
// Fetch piatti
const response = await fetch('https://your-domain.com/api/piatti?limit=10')
const { docs, totalDocs } = await response.json()

// Create piatto (autenticato)
const token = 'YOUR_JWT_TOKEN'
const response = await fetch('https://your-domain.com/api/piatti', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    nome: 'Carbonara',
    prezzo: 12.50,
    categoria: 'CATEGORIA_ID',
    inLista: true,
  }),
})
const { doc } = await response.json()
```

---

## 📚 Risorse

- **Documentazione Payload**: https://payloadcms.com/docs/queries/overview
- **GraphQL Docs**: https://payloadcms.com/docs/graphql/overview
- **Local API**: https://payloadcms.com/docs/local-api/overview
- **Progetto README**: `README.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
