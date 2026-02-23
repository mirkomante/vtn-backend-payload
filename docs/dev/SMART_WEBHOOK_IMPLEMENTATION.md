# Smart Webhook System - Architettura Multi-Frontend

## ✅ Stato Implementazione

Sistema Smart Webhook completamente refactorizzato per supportare un'architettura multi-frontend con bucket GCS dedicati per ogni target.

---

## 🏗 Architettura Multi-Frontend

### Concetto

Ogni frontend (es. menu digitale, sito corporate, shop) ha:
- Il suo **bucket GCS dedicato** (variabile d'ambiente separata)
- Il suo **file JSON** con solo i dati delle collezioni pertinenti
- La sua **configurazione** dichiarativa in `FRONTEND_TARGETS`

### Flusso di Routing

```
Modifica documento (es. piatti)
         ↓
   detectChangeType()
   fast-path / slow-path / none
         ↓
   getAffectedTargets('piatti')
   → filtra FRONTEND_TARGETS per target.collections.includes('piatti')
         ↓
   Per ogni target interessato:
   ├── fast-path → aggregateDataForTarget(req, target.collections)
   │              → uploadToGCSTarget(data, target)
   └── slow-path → sendPubSubMessage(collection, docId, changedFields)
```

---

## 📋 Componenti Implementati

### 1. Configurazione `FRONTEND_TARGETS`

**File**: `src/hooks/smartWebhook.ts`

Costante estensibile che definisce tutti i target frontend attivi:

```typescript
type FrontendTarget = {
  id: string          // Identificatore del target (es. 'menu')
  bucketEnv: string   // Nome della variabile d'ambiente del bucket GCS
  filename: string    // Nome del file JSON da generare
  collections: string[] // Slug delle collezioni da includere
}

const FRONTEND_TARGETS: FrontendTarget[] = [
  {
    id: 'menu',
    bucketEnv: 'GCS_MENU_BUCKET',
    filename: 'disponibilita.json',
    collections: [
      'piatti', 'vini', 'birre', 'cocktail', 'liquori', 'bevande', 'menu-fisso',
      'allergeni', 'categoria-piatti', 'categoria-menu-fisso',
      'tipologie-vino', 'tipologie-birra', 'tipologie-liquore',
      'tipologie-cocktail', 'tipologie-bevanda', 'servizi-accessori',
    ],
  },
  // Futuri target: 'corporate', 'shop', ecc.
]
```

### 2. Target Attivi

#### Target `menu`

| Proprietà | Valore |
|---|---|
| ID | `menu` |
| Variabile bucket | `GCS_MENU_BUCKET` |
| File output | `disponibilita.json` |
| Collezioni | 16 (7 menu + 9 impostazioni) |

**Gruppo Menu** (filtro `inLista: true`):
- ✅ piatti
- ✅ vini
- ✅ birre
- ✅ cocktail
- ✅ liquori
- ✅ bevande
- ✅ menu-fisso

**Gruppo Impostazioni** (tutti i documenti pubblicati):
- ✅ allergeni
- ✅ categoria-piatti
- ✅ categoria-menu-fisso
- ✅ tipologie-vino
- ✅ tipologie-birra
- ✅ tipologie-liquore
- ✅ tipologie-cocktail
- ✅ tipologie-bevanda
- ✅ servizi-accessori

### 3. Integrazioni Hook (invariate)

**Collezioni Dirette**:
- ✅ `src/collections/Piatti.ts`
- ✅ `src/collections/MenuFisso.ts`
- ✅ `src/collections/Allergene.ts`
- ✅ `src/collections/ServizioAccessorio.ts`

**Factory Collections**:
- ✅ `src/collections/factories/createBevandaCollection.ts`
- ✅ `src/collections/factories/createCategoriaCollection.ts`
- ✅ `src/collections/factories/createSimpleCollection.ts`

### 4. Dipendenze
- ✅ `@google-cloud/storage` v7.19.0
- ✅ `@google-cloud/pubsub` v5.2.3

---

## 🔧 Variabili d'Ambiente

### Variabili Richieste

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `GCP_PROJECT_ID` | ✅ Sì | ID del progetto Google Cloud |
| `GCS_MENU_BUCKET` | ✅ Sì (target menu) | Nome del bucket GCS per il frontend menu |

> **Nota**: `GCS_FRONTEND_BUCKET` è stato **sostituito** da `GCS_MENU_BUCKET`. Aggiornare le variabili d'ambiente in Cloud Run e in `.env.example`.

### Variabili Future (quando si aggiungono target)

| Variabile | Target | Descrizione |
|---|---|---|
| `GCS_CORPORATE_BUCKET` | corporate | Bucket per il sito corporate |
| `GCS_SHOP_BUCKET` | shop | Bucket per lo shop online |

### Comportamento se una variabile manca

Se `GCS_MENU_BUCKET` (o qualsiasi `bucketEnv`) non è impostata in produzione:
- Il sistema logga un **warning** (`⚠️`)
- Il target viene **skippato** (graceful skip)
- Gli altri target continuano normalmente
- L'operazione sul documento Payload **non viene bloccata**

---

## 🚀 Come Usare

### Development Mode (Mock)

```bash
NODE_ENV=development npm run dev
```

Quando modifichi un documento, vedrai nei log:

```
🚦 Smart Webhook triggered: piatti/123 (update)
   Analisi: fast-path - Campo inLista modificato
   🎯 Target interessati: menu
   🔧 [DEV MODE] Mock attivo - nessuna operazione GCP reale
   📦 [MOCK][menu] Aggregazione dati da 16 collezioni
   ☁️  [MOCK][menu] Upload su gs://NOT_CONFIGURED/disponibilita.json
   ✅ Mock completato
```

### Production Mode (Reale)

```bash
NODE_ENV=production \
GCS_MENU_BUCKET=vtn-menu-frontend \
GCP_PROJECT_ID=your-project-id \
npm run start
```

---

## 🔍 Logica di Decisione (Traffic Cop)

### Fast Path (Rigenera JSON)
Triggerato quando:
- Campo `inLista` cambia in una collezione menu
- Qualsiasi campo cambia in una collezione impostazioni
- Nuovo documento creato

**Azione**: Per ogni target interessato, aggrega i dati delle sue collezioni e carica il JSON nel suo bucket dedicato.

### Slow Path (Rebuild Completo)
Triggerato quando:
- Campi "pesanti" modificati: `nome`, `descrizione`, `prezzo`, `prezzoCalice`
- Relazioni modificate: `categoria`, `tipologia`, `allergeni`, `piatti`, `servizi`, `nazione`, `regione`, `zona`

**Azione**: Invia messaggio Pub/Sub al topic `rebuild-menu`.

---

## 📊 Struttura Output JSON

Il file `disponibilita.json` nel bucket `GCS_MENU_BUCKET` contiene:

```json
{
  "piatti": [...],                // Solo con inLista: true
  "vini": [...],                  // Solo con inLista: true
  "birre": [...],                 // Solo con inLista: true
  "cocktail": [...],              // Solo con inLista: true
  "liquori": [...],               // Solo con inLista: true
  "bevande": [...],               // Solo con inLista: true
  "menu-fisso": [...],            // Solo con inLista: true
  "allergeni": [...],             // Tutti pubblicati
  "categoria-piatti": [...],      // Tutti pubblicati
  "categoria-menu-fisso": [...],  // Tutti pubblicati
  "tipologie-vino": [...],        // Tutti pubblicati
  "tipologie-birra": [...],       // Tutti pubblicati
  "tipologie-liquore": [...],     // Tutti pubblicati
  "tipologie-cocktail": [...],    // Tutti pubblicati
  "tipologie-bevanda": [...],     // Tutti pubblicati
  "servizi-accessori": [...]      // Tutti pubblicati
}
```

---

## 🛡️ Pattern di Sicurezza Payload

Il codice implementa tutti i pattern critici:
- ✅ Passa sempre `req` alle operazioni nested (mantiene transazione)
- ✅ Context flag `skipSmartWebhook` per prevenire loop infiniti
- ✅ Gestisce correttamente draft vs published (`_status: 'published'`)
- ✅ Graceful skip per target con variabili d'ambiente mancanti

---

## 🔧 Ottimizzazioni

1. **Query Parallele**: Tutte le collezioni di un target vengono interrogate simultaneamente con `Promise.all()`
2. **Select Ottimizzato**: Solo i campi essenziali vengono recuperati (vedi `COLLECTION_FIELDS`)
3. **Depth Control**: `depth: 1` per menu collections, `depth: 0` per settings
4. **Cache Control**: `max-age=0` per forzare revalidation su GCS
5. **Error Resilience**: Ogni target in try-catch separato, non blocca gli altri target né l'operazione principale
6. **Graceful Skip**: Target con bucket non configurato viene saltato con warning, non errore fatale

---

## 📝 Come Aggiungere un Nuovo Target Frontend

1. **Crea il bucket GCS** nel progetto Google Cloud
2. **Aggiungi la variabile d'ambiente** (es. `GCS_CORPORATE_BUCKET`) in Cloud Run e `.env.example`
3. **Aggiungi il target** in `FRONTEND_TARGETS` in `src/hooks/smartWebhook.ts`:

```typescript
{
  id: 'corporate',
  bucketEnv: 'GCS_CORPORATE_BUCKET',
  filename: 'corporate-data.json',
  collections: ['piatti', 'allergeni'], // Solo le collezioni pertinenti
}
```

4. **Nessuna altra modifica necessaria**: il routing è automatico.

---

## 📝 Note Implementative

- **Singleton Clients**: I client GCS e Pub/Sub vengono inizializzati una sola volta (lazy initialization)
- **Topic Pub/Sub**: Nome fisso `rebuild-menu` (hardcoded)
- **Logging Strutturato**: Emoji + timestamp + target ID per facilità debug
- **Migrazione**: `GCS_FRONTEND_BUCKET` → `GCS_MENU_BUCKET` (breaking change nelle env vars)

---

## 🧪 Testing

Per testare il sistema:

1. **Avvia in development mode**: `npm run dev`
2. **Modifica un documento** nel CMS (es. cambia `inLista` di un piatto)
3. **Verifica i log** nella console per vedere il path seguito (Fast/Slow) e i target coinvolti

---

## 📚 File Modificati (Refactoring Multi-Frontend)

### File Modificati (1)
- `src/hooks/smartWebhook.ts` — Refactoring completo con architettura multi-target

### File da Aggiornare (Ambiente)
- `.env.example` — Sostituire `GCS_FRONTEND_BUCKET` con `GCS_MENU_BUCKET`
- Cloud Run service configuration — Aggiornare variabile d'ambiente

---

**Implementazione originale**: 11 Febbraio 2026  
**Refactoring multi-frontend**: 23 Febbraio 2026  
**Versione Payload CMS**: 3.74.0  
**Node Version**: 18.20.2+ / 20.9.0+
