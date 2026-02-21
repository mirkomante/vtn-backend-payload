# Guida alla Migrazione Dati

Questo documento spiega come utilizzare lo script di migrazione per importare i dati dal backend attuale (`vtn-backend`) in Payload CMS.

## Panoramica

Lo script di migrazione è implementato come endpoint custom Payload accessibile dall'admin panel. Recupera tutti i dati dal backend attuale tramite API REST e li importa in Payload CMS mantenendo le relazioni tra le collections.

## Caratteristiche

- ✅ **Endpoint custom** accessibile dall'admin panel
- ✅ **Interfaccia UI** con pulsante nel dashboard
- ✅ **Pulizia automatica** dei dati esistenti (eccetto utenti)
- ✅ **Mappatura ID** per mantenere le relazioni
- ✅ **Ordine di importazione** rispetta le dipendenze
- ✅ **Gestione errori** con logging dettagliato
- ✅ **Statistiche** di importazione per ogni collection

## Struttura File

```
src/
├── endpoints/
│   └── migrateData.ts              # Endpoint principale
├── lib/
│   └── migration/
│       ├── types.ts                # Tipi TypeScript
│       ├── fetcher.ts              # Client HTTP per API backend
│       ├── mapper.ts               # Sistema mappatura ID
│       ├── cleaner.ts              # Pulizia dati esistenti
│       └── importers/              # Importatori per ogni collection
│           ├── nazioni.ts
│           ├── regioni.ts
│           ├── zone.ts
│           ├── tipologie.ts
│           ├── allergeni.ts
│           ├── categorie.ts
│           ├── piatti.ts
│           ├── servizi.ts
│           ├── menuFisso.ts
│           ├── vini.ts
│           ├── birre.ts
│           ├── liquori.ts
│           ├── cocktail.ts
│           └── bevande.ts
└── components/
    └── MigrationButton.tsx         # Componente UI
```

## Come Usare

### 1. Accedi all'Admin Panel

1. Vai su `http://localhost:3000/admin` (o il tuo URL di produzione)
2. Effettua il login come **admin**

### 2. Avvia la Migrazione

1. Nel dashboard vedrai un pannello **"🔄 Migrazione Dati dal Backend Attuale"**
2. Leggi attentamente l'avviso
3. Clicca sul pulsante **"🚀 Avvia Migrazione"**
4. Conferma l'operazione nel dialog di conferma

### 3. Attendi il Completamento

- La migrazione può richiedere **2-10 minuti** a seconda del volume di dati
- **Non chiudere** la pagina durante l'operazione
- Vedrai un messaggio di conferma al termine

### 4. Verifica i Risultati

Dopo il completamento, il pannello mostrerà:

- ✅ Numero totale di documenti importati
- ⚠️ Numero di errori (se presenti)
- ⏱️ Tempo impiegato
- 📊 Dettagli per ogni collection (cliccando su "Mostra dettagli")

## Ordine di Importazione

Lo script importa i dati nel seguente ordine per rispettare le dipendenze:

1. **Nazioni** (nessuna dipendenza)
2. **Regioni** (dipende da Nazioni)
3. **Zone** (dipende da Regioni e Nazioni)
4. **Tipologie** (5 collections: vino, birra, liquore, cocktail, bevanda)
5. **Allergeni** (nessuna dipendenza)
6. **Categorie** (2 collections: categoria-piatti, categoria-menu-fisso)
7. **Piatti** (dipende da Categorie e Allergeni)
8. **Servizi Accessori** (nessuna dipendenza diretta)
9. **Menu Fisso** (dipende da Categorie, Piatti, Servizi)
10. **Bevande** (5 collections: vini, birre, liquori, cocktail, bevande)

## Cosa Viene Importato

### Collections Importate

- ✅ Nazioni, Regioni, Zone
- ✅ Tipologie (Vino, Birra, Liquore, Cocktail, Bevanda)
- ✅ Allergeni
- ✅ Categorie (Piatti, Menu Fisso)
- ✅ Piatti (con relazioni allergeni)
- ✅ Servizi Accessori
- ✅ Menu Fisso (con relazioni piatti e servizi)
- ✅ Vini (con nazione, regione, zona, tipologia)
- ✅ Birre (con nazione, tipologia)
- ✅ Liquori (con nazione, tipologia)
- ✅ Cocktail (con tipologia; nazione opzionale — importati anche senza nazione)
- ✅ Bevande (con tipologia; nazione opzionale — importati anche senza nazione)

### Stato Pubblicazione

Tutti i documenti importati sono creati con `_status: 'published'`, quindi sono immediatamente visibili nelle API pubbliche.

### Gestione Relazioni

Le relazioni many-to-many (Piatti↔Allergeni, MenuFisso↔Piatti, MenuFisso↔Servizi) vengono importate correttamente gestendo la struttura "junction table" dell'API sorgente. Lo script estrae automaticamente gli ID corretti dalle strutture nested.

**Nota**: Se nel backend sorgente esistono referenze a documenti eliminati (dangling references), questi vengono saltati silenziosamente durante l'importazione.

### Collections NON Toccate

- ❌ **Users** - Gli utenti esistenti non vengono modificati
- ❌ **Media** - I file media non vengono importati

## Avvertenze Importanti

⚠️ **ATTENZIONE**: Questa operazione:

1. **Elimina TUTTI i dati esistenti** (eccetto gli utenti)
2. **Non è reversibile** senza backup del database
3. **Richiede permessi admin**
4. **Può richiedere diversi minuti**

### Prima di Eseguire in Produzione

1. ✅ **Fai un backup completo del database**
2. ✅ **Testa in ambiente locale/staging**
3. ✅ **Verifica che il backend attuale sia online**
4. ✅ **Assicurati di avere tempo sufficiente**

## Gestione Errori

### Errori Comuni

1. **"Unauthorized"**: Non sei loggato come admin
2. **"Nazione non trovata" (log `ℹ️`)**: Per `bevande` e `cocktail` è un avviso informativo — il record viene importato ugualmente senza nazione. Per `vini`, `birre` e `liquori` rimane un errore bloccante (`⚠️`).
3. **"Tipologia non trovata"**: Relazioni mancanti — il record viene saltato

### In Caso di Errore

1. Controlla i **log della console** del browser
2. Controlla i **log del server** Payload
3. Verifica che il **backend attuale sia online**: `https://vtn-backend-203473363873.europe-west1.run.app/api/v1/health`
4. Se necessario, **ripulisci manualmente** il database e riprova

## Limitazioni Note

1. **Unique constraints**: Duplicati vengono gestiti con errore
2. **Performance**: Con migliaia di record può richiedere tempo
3. **Dangling references**: Referenze a documenti eliminati nel backend sorgente vengono ignorate

> **Nota**: La limitazione "Nazione required per Cocktail e Bevande" è stata rimossa. Il campo `nazione` è ora opzionale per queste due collections, permettendo l'importazione di voci generiche come "Acqua", "Caffè" e cocktail internazionali.

## Integrità Referenziale Post-Migrazione

Dopo la migrazione, Payload CMS gestisce automaticamente l'integrità referenziale. Quando elimini un documento:

| Documento Eliminato | Pulizia Automatica |
|---------------------|-------------------|
| **Piatto** | Rimosso da tutti i `menu-fisso.piatti` |
| **Servizio** | Rimosso da tutti i `menu-fisso.servizi` |
| **Allergene** | Rimosso da tutti i `piatti.allergeni` |

Questo previene le "dangling references" e mantiene il database consistente.

## Endpoint API

L'endpoint di migrazione è disponibile a:

```
POST /api/migrate-data
```

Richiede autenticazione admin. Restituisce:

```json
{
  "success": true,
  "stats": [
    {
      "collection": "nazioni",
      "imported": 15,
      "skipped": 0,
      "errors": 0
    }
    // ... altre collections
  ],
  "totalImported": 450,
  "totalSkipped": 2,
  "totalErrors": 0,
  "duration": 45000
}
```

## Sviluppo

### Aggiungere Nuove Collections

1. Crea un nuovo importatore in `src/lib/migration/importers/`
2. Aggiungi i tipi in `src/lib/migration/types.ts`
3. Registra l'importatore in `src/endpoints/migrateData.ts`
4. Aggiorna `fetchAllData()` se necessario

### Debug

Per vedere i log dettagliati:

1. Apri la **console del browser** (F12)
2. Apri i **log del server** Payload
3. Cerca messaggi con emoji: 🚀 🔄 📦 ✅ ⚠️ ❌

## Supporto

Per problemi o domande:

1. Verifica questa guida
2. Controlla i log di errore
3. Contatta il team di sviluppo
