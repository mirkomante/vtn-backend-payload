# Smart Webhook System - Implementazione Completata

## ✅ Stato Implementazione

Tutti i componenti del sistema Smart Webhook sono stati implementati con successo.

## 📋 Componenti Implementati

### 1. Hook Principale
**File**: `src/hooks/smartWebhook.ts`

Sistema di webhook intelligente che implementa il pattern "Traffic Cop":
- ✅ Analisi automatica dei cambiamenti (doc vs previousDoc)
- ✅ Fast Path: Rigenera `disponibilita.json` per cambi rapidi
- ✅ Slow Path: Invia messaggio Pub/Sub per rebuild completo
- ✅ Mock completo per development mode
- ✅ Gestione errori resiliente

### 2. Configurazione Collezioni

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

### 3. Integrazioni Hook

**Collezioni Dirette**:
- ✅ `src/collections/Piatti.ts` - afterChange hook aggiunto
- ✅ `src/collections/MenuFisso.ts` - afterChange hook aggiunto
- ✅ `src/collections/Allergene.ts` - afterChange hook aggiunto
- ✅ `src/collections/ServizioAccessorio.ts` - afterChange hook aggiunto

**Factory Collections**:
- ✅ `src/collections/factories/createBevandaCollection.ts` - Hook integrato (vini, birre, cocktail, liquori, bevande)
- ✅ `src/collections/factories/createCategoriaCollection.ts` - Hook integrato (categorie piatti e menu fisso)
- ✅ `src/collections/factories/createSimpleCollection.ts` - Hook integrato (tutte le tipologie)

### 4. Dipendenze
- ✅ `@google-cloud/storage` v7.19.0 - Già installato
- ✅ `@google-cloud/pubsub` v5.2.3 - Già installato

### 5. Configurazione Ambiente
- ✅ `.env.example` aggiornato con:
  - `GCS_FRONTEND_BUCKET` - Bucket per disponibilita.json
  - Documentazione Pub/Sub

### 6. Validazione
- ✅ TypeScript: Nessun errore (`tsc --noEmit`)
- ✅ Types rigenerati (`npm run generate:types`)

## 🚀 Come Usare

### Development Mode (Mock)

```bash
NODE_ENV=development npm run dev
```

Quando modifichi un documento, vedrai nei log:

```
🚦 Smart Webhook triggered: piatti/123 (update)
   Analisi: fast-path - Campo inLista modificato
   🔧 [DEV MODE] Mock attivo - nessuna operazione GCP reale
   📦 [MOCK] Aggregazione dati da 16 collezioni
   ☁️  [MOCK] Upload su gs://NOT_CONFIGURED/disponibilita.json
   ✅ Mock completato
```

### Production Mode (Reale)

```bash
NODE_ENV=production \
GCS_FRONTEND_BUCKET=your-bucket-name \
GCP_PROJECT_ID=your-project-id \
npm run start
```

## 🔍 Logica di Decisione

### Fast Path (Rigenera JSON)
Triggerato quando:
- Campo `inLista` cambia in una collezione menu
- Qualsiasi campo cambia in una collezione impostazioni
- Nuovo documento creato

**Azione**: Aggrega dati da tutte le 16 collezioni e carica `disponibilita.json` su GCS

### Slow Path (Rebuild Completo)
Triggerato quando:
- Campi "pesanti" modificati: `nome`, `descrizione`, `prezzo`, `prezzoCalice`
- Relazioni modificate: `categoria`, `tipologia`, `allergeni`, `piatti`, `servizi`, `nazione`, `regione`, `zona`

**Azione**: Invia messaggio Pub/Sub al topic `rebuild-menu`

## 📊 Struttura Output JSON

Il file `disponibilita.json` contiene:

```json
{
  "piatti": [...],           // Solo con inLista: true
  "vini": [...],             // Solo con inLista: true
  "birre": [...],            // Solo con inLista: true
  "cocktail": [...],         // Solo con inLista: true
  "liquori": [...],          // Solo con inLista: true
  "bevande": [...],          // Solo con inLista: true
  "menu-fisso": [...],       // Solo con inLista: true
  "allergeni": [...],        // Tutti pubblicati
  "categoria-piatti": [...], // Tutti pubblicati
  "categoria-menu-fisso": [...], // Tutti pubblicati
  "tipologie-vino": [...],   // Tutti pubblicati
  "tipologie-birra": [...],  // Tutti pubblicati
  "tipologie-liquore": [...], // Tutti pubblicati
  "tipologie-cocktail": [...], // Tutti pubblicati
  "tipologie-bevanda": [...], // Tutti pubblicati
  "servizi-accessori": [...] // Tutti pubblicati
}
```

## 🛡️ Pattern di Sicurezza Payload

Il codice implementa tutti i pattern critici:
- ✅ Passa sempre `req` alle operazioni nested (mantiene transazione)
- ✅ Usa `overrideAccess: false` quando necessario
- ✅ Context flag `skipSmartWebhook` per prevenire loop infiniti
- ✅ Gestisce correttamente draft vs published (`_status: 'published'`)

## 🔧 Ottimizzazioni

1. **Query Parallele**: Tutte le 16 collezioni vengono interrogate simultaneamente con `Promise.all()`
2. **Select Ottimizzato**: Solo i campi essenziali vengono recuperati (vedi `COLLECTION_FIELDS` nell'hook)
3. **Depth Control**: `depth: 1` per menu collections, `depth: 0` per settings
4. **Cache Control**: `max-age=0` per forzare revalidation su GCS
5. **Error Resilience**: Ogni operazione GCP in try-catch separato, non blocca l'operazione principale

## 📝 Note Implementative

- **Singleton Clients**: I client GCS e Pub/Sub vengono inizializzati una sola volta (lazy initialization)
- **Topic Pub/Sub**: Nome fisso `rebuild-menu` (hardcoded come richiesto)
- **Filename Output**: `disponibilita.json` (hardcoded)
- **Logging Strutturato**: Emoji + timestamp per facilità debug

## 🧪 Testing

Per testare il sistema:

1. **Avvia in development mode**: `npm run dev`
2. **Modifica un documento** nel CMS (es. cambia `inLista` di un piatto)
3. **Verifica i log** nella console per vedere il path seguito (Fast/Slow)

## 📚 File Modificati

### Nuovi File (1)
- `src/hooks/smartWebhook.ts` (670 righe)

### File Modificati (8)
- `.env.example` - Variabili ambiente
- `src/collections/Piatti.ts` - Hook integrato
- `src/collections/MenuFisso.ts` - Hook integrato
- `src/collections/Allergene.ts` - Hook integrato
- `src/collections/ServizioAccessorio.ts` - Hook integrato
- `src/collections/factories/createBevandaCollection.ts` - Hook integrato
- `src/collections/factories/createCategoriaCollection.ts` - Hook integrato
- `src/collections/factories/createSimpleCollection.ts` - Hook integrato

## ✨ Prossimi Passi

Per utilizzare il sistema in produzione:

1. **Configura GCS Bucket**: Crea bucket per frontend data
2. **Configura Pub/Sub Topic**: Crea topic `rebuild-menu`
3. **Imposta Variabili Ambiente**:
   ```bash
   GCS_FRONTEND_BUCKET=your-bucket-name
   GCP_PROJECT_ID=your-project-id
   ```
4. **Deploy su Cloud Run** con le variabili configurate
5. **Implementa Consumer Pub/Sub** per gestire i messaggi `rebuild-menu`

---

**Implementazione completata il**: 11 Febbraio 2026  
**Versione Payload CMS**: 3.74.0  
**Node Version**: 18.20.2+ / 20.9.0+
