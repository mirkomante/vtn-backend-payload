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
| `descrizione` | `richText` | Descrizione del piatto | ❌ |
| `prezzo` | `number` | Prezzo (max 10 cifre, 2 decimali) | ✅ |
| `inLista` | `boolean` | Visibile nel menu pubblico | ✅ (default: `true`) |
| `glutenFree` | `boolean` | Senza glutine | ❌ (default: `false`) |
| `noUovo` | `boolean` | Senza uova | ❌ (default: `false`) |
| `noLatticini` | `boolean` | Senza latticini | ❌ (default: `false`) |
| `categoria` | `relationship` | Categoria piatto (`categoria-piatti`) | ✅ |
| `allergeni` | `relationship[]` | Lista allergeni | ❌ |

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
| `descrizione` | `richText` | Descrizione del menu | ❌ |
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
| `descrizione` | `richText` | Descrizione del vino | ❌ |
| `prezzo` | `number` | Prezzo | ✅ |
| `inLista` | `boolean` | Visibile nella carta vini | ✅ |
| `categoria` | `select` | Tipologia vino | ✅ |
| `produttore` | `string` | Nome produttore | ❌ |
| `annata` | `number` | Anno di produzione | ❌ |
| `gradazione` | `number` | Gradazione alcolica | ❌ |
| `zona` | `relationship` | Zona geografica | ❌ |
| `regione` | `relationship` | Regione | ❌ |
| `nazione` | `relationship` | Nazione | ❌ |

#### Categorie Vino

```typescript
enum CategoriaVino {
  'bianco' = 'Bianco',
  'rosso' = 'Rosso',
  'rosato' = 'Rosato',
  'bollicine' = 'Bollicine',
  'passito' = 'Passito',
  'liquoroso' = 'Liquoroso'
}
```

#### Esempi

**Vini rossi toscani**:

```bash
GET /api/vini?where[categoria][equals]=rosso&where[regione.nome][equals]=Toscana&depth=1
```

**Vini per fascia di prezzo**:

```bash
GET /api/vini?where[prezzo][greater_than]=20&where[prezzo][less_than]=50
```

---

### Birre

**Slug**: `birre`  
**Endpoint**: `/api/birre`

#### Schema

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `nome` | `string` | Nome della birra |
| `descrizione` | `richText` | Descrizione |
| `prezzo` | `number` | Prezzo |
| `inLista` | `boolean` | Visibile |
| `produttore` | `string` | Birrificio |
| `gradazione` | `number` | Gradazione alcolica |
| `formato` | `string` | Formato (es. "33cl", "75cl") |
| `tipologia` | `relationship` | Tipologia birra |
| `nazione` | `relationship` | Nazione di origine |

---

### Cocktail

**Slug**: `cocktail`  
**Endpoint**: `/api/cocktail`

#### Schema

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `nome` | `string` | Nome cocktail |
| `descrizione` | `richText` | Descrizione |
| `prezzo` | `number` | Prezzo |
| `inLista` | `boolean` | Visibile |
| `ingredienti` | `text` | Lista ingredienti |
| `categoria` | `select` | Categoria cocktail |

---

### Categorie

#### Categoria Piatti

**Slug**: `categoria-piatti`  
**Endpoint**: `/api/categoria-piatti`

```json
{
  "id": "cat1",
  "nome": "Antipasti",
  "descrizione": "Stuzzichini e antipasti",
  "ordine": 1
}
```

#### Categoria Menu Fisso

**Slug**: `categoria-menu-fisso`  
**Endpoint**: `/api/categoria-menu-fisso`

```json
{
  "id": "cat2",
  "nome": "Menu Degustazione",
  "descrizione": "Menu completi",
  "ordine": 1
}
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
GET /api/piatti?sort=-prezzo  # Decrescente
GET /api/piatti?sort=nome     # Crescente
```

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
