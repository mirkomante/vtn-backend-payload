# CHANGELOG — vtn-backend-payload

---

## 2026-03-29 — Audit completo e riorganizzazione /docs

### Descrizione
Audit completo del repository con lettura diretta di tutti i file sorgente. Produzione di documentazione aggiornata allo stato reale del codice. Riorganizzazione della directory `/docs` secondo la struttura standard di progetto.

### File coinvolti

**Creati:**
- `docs/ARCHITETTURA.md` — stack, infrastruttura GCP, diagramma flusso dati, pattern factory, note critiche per agenti AI
- `docs/SVILUPPO.md` — setup locale, comandi pnpm, variabili d'ambiente, migrazioni, deploy
- `docs/STATO.md` — stato reale per area (OAuth, RBAC, Collections, Globals, Componenti, Tailwind, Smart Webhook, Migrations), debiti tecnici con priorità, roadmap
- `docs/CHANGELOG.md` — questo file

**Aggiornati:**
- `README.md` — descrizione reale del progetto, indice a `/docs`, avvio rapido
- `KB_BACKEND.md` — aggiornata data audit, aggiunta sezione debiti tecnici DT-01..DT-10

### Decisioni architetturali

Nessuna modifica al codice sorgente. Solo documentazione.

### Incongruenze trovate (⚠️)

- **DT-01**: `piattiOrderBy: 'order'` (e analoghi per tutte le 6 sezioni) è ancora `defaultValue` in `OrdinamentoMenu.ts` dopo la rimozione del campo `order` — debito tecnico ad alta priorità
- **DT-02**: Rate limiting documentato in `API_REFERENCE.md` ma non implementato nel codice
- **DT-03**: `LanguageToggle.tsx` — componente orfano, non importato da nessun file
- **DT-04**: `GoogleLoginButton.tsx` — componente orfano o duplicato (LoginView ha il bottone inline)
- **DT-07**: `docs/ai/DOCS_INDEX.md` cita `generali` come "Collection" — nel codice è un **Global**

---

## Storico precedente

Per la storia delle modifiche prima del 2026-03-29, consultare `docs/ai/DOCS_INDEX.md` → sezione "Aggiornamenti Documentazione".
