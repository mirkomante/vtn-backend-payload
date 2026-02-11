# Indice Documentazione Progetto

Guida rapida per navigare la documentazione del progetto. Ottimizzata per consultazione sia umana che da LLM (Large Language Models) come Cursor AI.

## 🎯 Quick Start

**Per iniziare subito**:
1. Leggi [README.md](./README.md) per il setup iniziale
2. Consulta [API_REFERENCE.md](./API_REFERENCE.md) per l'uso delle API
3. In caso di problemi: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📁 Struttura Documentazione

### Documentazione Principale

#### 1. [README.md](./README.md)
**Scopo**: Panoramica generale del progetto  
**Per**: Sviluppatori che iniziano sul progetto, setup iniziale  
**Contiene**:
- Funzionalità principali del sistema
- Stack tecnologico
- Setup sviluppo locale
- Configurazione Cloud Run
- Migrazioni database
- Scripts disponibili

**Quando consultare**:
- ✅ Prima volta sul progetto
- ✅ Setup ambiente di sviluppo
- ✅ Deploy su Cloud Run
- ✅ Gestione migrazioni database
- ✅ Comprensione architettura generale

---

#### 2. [API_REFERENCE.md](./API_REFERENCE.md)
**Scopo**: Documentazione completa delle API REST e GraphQL  
**Per**: Sviluppatori frontend, integrazioni API, testing  
**Contiene**:
- Tutti gli endpoints REST disponibili
- Schema completo di ogni collection
- Esempi di query e mutation GraphQL
- Filtri e operatori di ricerca
- Autenticazione e permessi
- Rate limiting

**Quando consultare**:
- ✅ Sviluppo frontend che consuma API
- ✅ Integrazione con sistemi esterni
- ✅ Testing API con cURL o Postman
- ✅ Capire struttura dati collections
- ✅ Query complesse con filtri

**Esempio query rapida**:
```bash
# Piatti senza glutine sotto 15€
GET /api/piatti?where[glutenFree][equals]=true&where[prezzo][less_than]=15
```

---

#### 3. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
**Scopo**: Risoluzione problemi tecnici comuni  
**Per**: Debug, errori di build/runtime, problemi di deploy  
**Contiene**:
- **Admin Panel bianco su Cloud Run** (ImportMap)
- Errori TypeScript e type generation
- Problemi autenticazione Google OAuth
- Errori database e migrazioni
- Problemi storage e media upload
- UI e styling issues

**Quando consultare**:
- ✅ Pagina admin bianca in produzione
- ✅ Errori durante il build
- ✅ Login non funziona
- ✅ Upload immagini fallisce
- ✅ Scroll o layout anomalo
- ✅ Errori database connection

**Sezioni chiave per LLM**:
- Admin Panel Bianco → Causa: ImportMap + plugin condizionali
- Errori ImportMap → Pattern `enabled` vs esclusione condizionale
- Problemi UI → Fix CSS per wrapper Payload

---

#### 4. [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)
**Scopo**: Guida all'uso di Tailwind CSS nell'admin Payload  
**Per**: Sviluppo UI componenti custom per admin panel  
**Contiene**:
- Setup Tailwind CSS v4
- Integrazione con Payload CMS
- Uso variabili CSS Payload
- LoginView e fix scroll verticale
- Best practices styling
- Dark mode

**Quando consultare**:
- ✅ Sviluppo componenti custom per admin
- ✅ Styling pagine personalizzate
- ✅ Fix problemi layout/scroll
- ✅ Supporto dark mode
- ✅ Usare variabili tema Payload

**Key patterns**:
```tsx
// Usa variabili Payload con Tailwind
className="bg-[var(--theme-elevation-500)] text-[var(--theme-text)]"
```

---

#### 5. [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md)
**Scopo**: Documentazione tecnica del sistema di webhook intelligente  
**Per**: Backend developers, DevOps, LLM  
**Contiene**:
- Architettura "Traffic Cop" (Fast vs Slow Path)
- Configurazione GCS e Pub/Sub
- Integrazione collezioni Menu e Impostazioni
- Logica di aggregazione dati (disponibilita.json)
- Setup development (mock) vs production

**Quando consultare**:
- ✅ Modifiche alla logica di aggiornamento menu
- ✅ Debug mancato aggiornamento frontend
- ✅ Aggiunta nuove collezioni al sistema
- ✅ Configurazione infrastruttura GCP (Bucket, Pub/Sub)

**Key patterns**:
```typescript
// Traffic Cop Pattern
if (inListaChanged) return 'fast-path' // Rigenera JSON
if (heavyFieldsChanged) return 'slow-path' // Rebuild completo
```

---

#### 6. [AGENTS.md](./AGENTS.md)
**Scopo**: Regole di sviluppo Payload CMS per AI agents  
**Per**: LLM, Cursor AI, sviluppatori che seguono best practices  
**Contiene**:
- Pattern critici di sicurezza
- Configurazione Payload corretta
- Access control patterns
- Hook patterns
- Query patterns
- Component development

**Quando consultare**:
- ✅ Sviluppo con Cursor AI
- ✅ Implementazione access control
- ✅ Scrittura hooks
- ✅ Pattern plugin condizionali
- ✅ Componenti custom admin

**Pattern critici**:
```typescript
// ❌ SBAGLIATO - Plugin condizionale
const plugin = env.VAR ? [plugin(...)] : []

// ✅ CORRETTO - Usa enabled
const plugin = plugin({ enabled: Boolean(env.VAR) })
```

---

### Documentazione di Dettaglio

#### 7. [.cursor/rules/](./cursor/rules/)
**Scopo**: Context rules specifici per Cursor AI  
**Per**: LLM che lavorano sul progetto  
**Contiene**:
- `security-critical.mdc`: Pattern sicurezza critici
- `collections.md`: Configurazione collections
- `fields.md`: Tipi di field e pattern
- `access-control.md`: Gestione permessi
- `hooks.md`: Lifecycle hooks
- `queries.md`: Query e Local API
- `components.md`: Componenti custom
- E molti altri...

**Quando consultare**:
- ✅ Implementazione specifica di feature Payload
- ✅ Pattern avanzati (access control, hooks, etc.)
- ✅ Deep dive su funzionalità specifiche

---

## 🔍 Ricerca per Task

### Setup & Deployment

| Task | Documento |
|------|-----------|
| Setup iniziale progetto | [README.md](./README.md) → Sviluppo Locale |
| Deploy su Cloud Run | [README.md](./README.md) → Deploy su Google Cloud Run |
| Configurare variabili d'ambiente | [README.md](./README.md) → Variabili d'ambiente in produzione |
| Connessione Cloud SQL | [README.md](./README.md) → Connessione a Cloud SQL |

### Sviluppo Collections & API

| Task | Documento |
|------|-----------|
| Struttura dati collections | [API_REFERENCE.md](./API_REFERENCE.md) → Collections API |
| Creare nuova collection | [AGENTS.md](./AGENTS.md) + [.cursor/rules/collections.md](./.cursor/rules/collections.md) |
| Implementare access control | [.cursor/rules/access-control.md](./.cursor/rules/access-control.md) |
| Aggiungere hook | [.cursor/rules/hooks.md](./.cursor/rules/hooks.md) |
| Query avanzate | [API_REFERENCE.md](./API_REFERENCE.md) → Querying |

### UI & Componenti

| Task | Documento |
|------|-----------|
| Creare componente custom admin | [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md) + [.cursor/rules/components.md](./.cursor/rules/components.md) |
| Styling con Tailwind | [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md) |
| Fix scroll/layout issues | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Problemi UI e Styling |
| LoginView personalizzata | [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md) → LoginView |

### Smart Webhook & Integrazioni

| Task | Documento |
|------|-----------|
| Capire logica aggiornamento menu | [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md) |
| Debug mancato aggiornamento JSON | [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md) → Troubleshooting |
| Configurare GCS per frontend | [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md) → Setup |
| Aggiungere collezione al webhook | [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md) → Integrazione |

### Troubleshooting

| Problema | Documento | Sezione |
|----------|-----------|---------|
| Admin bianco su Cloud Run | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Admin Panel Bianco su Cloud Run |
| Componente non trovato in importMap | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Errori ImportMap |
| Plugin condizionali | [README.md](./README.md) + [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Import Map e Plugin Condizionali |
| Errori TypeScript | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Errori TypeScript |
| Login non funziona | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problemi di Autenticazione |
| Upload media fallisce | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problemi Storage e Media |
| Scroll verticale indesiderato | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) + [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md) | Scroll Verticale nella Pagina di Login |

### Migrazioni & Database

| Task | Documento |
|------|-----------|
| Creare migrazione | [README.md](./README.md) → Migrazioni Database |
| Applicare migrazioni | [README.md](./README.md) → Migrazioni Database |
| Errori connection | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Errori Database |

---

## 🤖 Guida per LLM

### Workflow Consigliato

Quando un LLM (come Cursor AI) lavora su questo progetto:

1. **Prima volta sul progetto**:
   - Leggi [README.md](./README.md) per contesto generale
   - Leggi [AGENTS.md](./AGENTS.md) per regole di sviluppo Payload

2. **Per task specifici**:
   - Consulta questa guida (DOCS_INDEX.md) per trovare il documento giusto
   - Leggi la sezione specifica del documento indicato
   - Consulta [.cursor/rules/](./.cursor/rules/) per pattern avanzati se necessario

3. **Debug errori**:
   - Inizia sempre da [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Cerca l'errore specifico o sintomo
   - Segui gli step di risoluzione

### Pattern Critici da Ricordare

**ImportMap e Plugin**:
```typescript
// ✅ SEMPRE usa enabled per plugin condizionali
const plugin = gcsStorage({
  bucket: process.env.GCS_BUCKET || 'not-configured',
  enabled: Boolean(process.env.GCS_BUCKET),
})

// ❌ MAI esclusione condizionale
const plugin = env.GCS_BUCKET ? [gcsStorage(...)] : []
```

**Access Control**:
```typescript
// ✅ SEMPRE overrideAccess: false quando passi user
await payload.find({
  collection: 'posts',
  user: req.user,
  overrideAccess: false,  // REQUIRED
})
```

**Hooks con Transazioni**:
```typescript
// ✅ SEMPRE passa req per transazioni
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req,  // Mantiene atomicità
      })
    },
  ],
}
```

**Tailwind nell'Admin**:
```tsx
// ✅ Usa variabili Payload per coerenza
<div className="bg-[var(--theme-elevation-500)] text-[var(--theme-text)]">
  Content
</div>
```

---

## 📝 Aggiornamenti Documentazione

### Storia Recente

**Febbraio 2026**:
- ✅ **Smart Webhook System**: Implementazione logica Traffic Cop per aggiornamento menu
- ✅ Fix ImportMap con plugin GCS condizionale
- ✅ LoginView UI redesign con Tailwind
- ✅ Fix scroll verticale pagina login
- ✅ Documentazione completa troubleshooting
- ✅ API reference creata

### Contribuire

Quando aggiungi funzionalità o fix:

1. **Aggiorna sempre**:
   - [README.md](./README.md) se cambia setup/deploy
   - [API_REFERENCE.md](./API_REFERENCE.md) se aggiungi/modifichi API
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) se risolvi bug comune
   - [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md) se modifichi styling

2. **Aggiorna questo indice** se:
   - Crei nuovi documenti
   - Aggiungi sezioni importanti
   - Cambi struttura documentazione

3. **Testa sempre**:
   ```bash
   npx tsc --noEmit  # Verifica TypeScript
   pnpm build        # Verifica build
   ```

---

## 📚 Risorse Esterne

- **Payload CMS Docs**: https://payloadcms.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Google Cloud Run**: https://cloud.google.com/run/docs

---

## 🔑 Keywords per Ricerca

**Per LLM e ricerca full-text**:

- `importMap` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [README.md](./README.md)
- `plugin condizionali` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [AGENTS.md](./AGENTS.md)
- `pagina bianca` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- `GCS storage` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [README.md](./README.md)
- `access control` → [AGENTS.md](./AGENTS.md), [.cursor/rules/access-control.md](./.cursor/rules/access-control.md)
- `hooks` → [AGENTS.md](./AGENTS.md), [.cursor/rules/hooks.md](./.cursor/rules/hooks.md)
- `tailwind` → [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)
- `scroll verticale` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)
- `LoginView` → [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)
- `GraphQL` → [API_REFERENCE.md](./API_REFERENCE.md)
- `REST API` → [API_REFERENCE.md](./API_REFERENCE.md)
- `migrazioni` → [README.md](./README.md), [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- `deploy` → [README.md](./README.md), [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- `OAuth` → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [API_REFERENCE.md](./API_REFERENCE.md)
- `webhook` → [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md)
- `traffic cop` → [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md)
- `disponibilita.json` → [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md)
- `pubsub` → [SMART_WEBHOOK_IMPLEMENTATION.md](./SMART_WEBHOOK_IMPLEMENTATION.md)

---

**Ultimo aggiornamento**: Febbraio 2026  
**Versione**: 1.0.0
