# Stato del Progetto — vtn-backend-payload

> Audit eseguito il: 2026-03-29  
> Basato su: lettura diretta del codice sorgente (non su documentazione precedente)

---

## Report di audit per area

### 1. Google OAuth 2.0 — ✅ Completo

| Aspetto | Stato | Note |
|---|---|---|
| `disableLocalStrategy: true` | ✅ | Confermato in `src/collections/Users.ts` riga 10 |
| Flusso authorize → callback | ✅ | `OAuth2Plugin` configurato in `payload.config.ts` |
| JWT cookie HTTP-only | ✅ | Gestito da Payload + `payload-oauth2` |
| Redirect successo → `/admin` | ✅ | `successRedirect` restituisce `/admin` |
| Redirect errore → `/admin/login?error=oauth_failed` | ✅ | `failureRedirect` configurato |
| `LoginView` personalizzata | ✅ | `src/components/LoginView.tsx` — solo bottone Google |
| `sub` salvato nel JWT | ✅ | `saveToJWT: true` in `Users.ts` |

---

### 2. RBAC — Ruoli e permessi — ✅ Completo

| Aspetto | Stato | Note |
|---|---|---|
| Ruoli definiti (`admin`, `user`) | ✅ | `options: ['admin', 'user']` in `Users.ts` |
| `roles` salvato nel JWT | ✅ | `saveToJWT: true` |
| `sub` salvato nel JWT | ✅ | `saveToJWT: true` |
| Primo utente → admin automatico | ✅ | Hook `beforeChange` in `Users.ts` |
| Access functions per collections menu | ✅ | `menuRistoranteReadAccess/UpdateAccess/DeleteAccess` |
| Access functions per globals/config | ✅ | `menuImpostazioniReadAccess/UpdateAccess/DeleteAccess` |
| Filtro `_status: published` per non-admin | ✅ | Implementato in entrambe le funzioni di accesso |
| `versions: { drafts: true }` dove richiesto | ✅ | Tutte le collections e globals con `_status` filter |

**Tabella permessi per collection:**

| Collection | Read | Update | Delete | Drafts |
|---|---|---|---|---|
| `piatti` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `menu-fisso` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `vini` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `birre` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `liquori` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `cocktail` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `bevande` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `servizi-accessori` | `menuRistoranteReadAccess` | `menuRistoranteUpdateAccess` | `menuRistoranteDeleteAccess` | ✅ |
| `allergeni` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `categoria-piatti` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `categoria-menu-fisso` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `tipologie-*` (5) | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `nazioni` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `regioni` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `zone` | `menuImpostazioniReadAccess` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ✅ |
| `media` | `read: () => true` | default Payload | default Payload | ❌ |
| `media-ristorante` | `read: () => true` | `menuImpostazioniUpdateAccess` | `menuImpostazioniDeleteAccess` | ❌ |
| `users` | default Payload | default Payload | default Payload | ❌ |

---

### 3. Collections — struttura e stato — ✅ Completo

**22 collections totali** (18 file + 5 tipologie da `Tipologie.ts`).

| Collection | Slug | Drafts | Access | Hook afterChange | Hook beforeDelete | Note |
|---|---|---|---|---|---|---|
| Users | `users` | ❌ | default Payload | — | — | Solo OAuth |
| Piatti | `piatti` | ✅ | menuRistorante* | smartWebhook | cleanupRelationships | |
| MenuFisso | `menu-fisso` | ✅ | menuRistorante* | smartWebhook | — | |
| Vino | `vini` | ✅ | menuRistorante* | smartWebhook | — | factory |
| Birra | `birre` | ✅ | menuRistorante* | smartWebhook | — | factory |
| Liquore | `liquori` | ✅ | menuRistorante* | smartWebhook | — | factory |
| Cocktail | `cocktail` | ✅ | menuRistorante* | smartWebhook | — | factory |
| Bevanda | `bevande` | ✅ | menuRistorante* | smartWebhook | — | factory |
| ServizioAccessorio | `servizi-accessori` | ✅ | menuRistorante* | smartWebhook | cleanupRelationships | |
| Allergene | `allergeni` | ✅ | menuImpostazioni* | smartWebhook | cleanupRelationships | |
| CategoriaPiatti | `categoria-piatti` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| CategoriaMenuFisso | `categoria-menu-fisso` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| TipologiaVino | `tipologie-vino` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| TipologiaBirra | `tipologie-birra` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| TipologiaLiquore | `tipologie-liquore` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| TipologiaCocktail | `tipologie-cocktail` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| TipologiaBevanda | `tipologie-bevanda` | ✅ | menuImpostazioni* | smartWebhook | — | factory |
| Nazione | `nazioni` | ✅ | menuImpostazioni* | — | — | beforeChange: uppercase sigla |
| Regione | `regioni` | ✅ | menuImpostazioni* | — | — | beforeChange: unicità (nome, nazione) |
| Zona | `zone` | ✅ | menuImpostazioni* | — | — | beforeChange: unicità (nome, regione) |
| Media | `media` | ❌ | read pubblico | — | — | afterRead: URL GCS |
| MediaRistorante | `media-ristorante` | ❌ | read pubblico | — | — | afterRead: URL GCS |

**Campo `order`**: confermato rimosso da tutte le collections con migrazione `20260301_155509_remove_order_fields`. `defaultSort: 'updatedAt'` su tutte le factory collections.

---

### 4. Globals — struttura e stato — ✅ Completo

| Global | Slug | Drafts | Access | Hook | Note |
|---|---|---|---|---|---|
| Generali | `generali` | ✅ | menuImpostazioni* | — | Orari, fasce pranzo/cena, eccezioni |
| MenuConfig | `menu-config` | ✅ | menuImpostazioni* | — | Struttura sezioni menu, logo, isActive |
| OrdinamentoMenu | `ordinamento-menu` | ✅ | menuImpostazioni* | — | Sort/groupBy per 6 sezioni |

**Anomalia confermata**: `piattiOrderBy: 'order'` (e analoghi per vini, liquori, birre, cocktail, bevande) è ancora presente come opzione `select` in `OrdinamentoMenu.ts` con `defaultValue: 'order'`, ma il campo `order` è stato rimosso dalle collections. Se il frontend usa questo valore, l'ordinamento non funzionerà.

---

### 5. Componenti custom — stato

| Componente | File | Usato in | Stato | Note |
|---|---|---|---|---|
| `LoginView` | `src/components/LoginView.tsx` | `payload.config.ts` → `views.login` | ✅ | Server Component, solo bottone Google OAuth |
| `NavFooter` | `src/components/NavFooter.tsx` | `payload.config.ts` → `afterNavLinks` | ✅ | Contiene `ThemeToggle` + `LogoutButton` |
| `ThemeToggle` | `src/components/ThemeToggle.tsx` | `NavFooter.tsx` | ✅ | Client Component, alterna light/dark |
| `LanguageToggle` | `src/components/LanguageToggle.tsx` | **non usato** | ❌ | Importato da nessun file — componente orfano |
| `MigrationButton` | `src/components/MigrationButton.tsx` | `payload.config.ts` → dashboard widget | ✅ | Client Component, chiama `/api/migrate-data` |
| `SaveDraftButtonWithCancel` | `src/components/SaveDraftButtonWithCancel.tsx` | `cancelButtonPlugin.ts` | ✅ | Wrapper SaveDraftButton + bottone Annulla |
| `CancelButton` | `src/components/CancelButton.tsx` | — | ❓ | Da verificare se usato o sostituito da `SaveDraftButtonWithCancel` |
| `LogoutButton` | `src/components/LogoutButton.tsx` | `NavFooter.tsx` | ✅ | |
| `GoogleLoginButton` | `src/components/GoogleLoginButton.tsx` | — | ❓ | Non importato da `LoginView.tsx` — da verificare se usato |
| `PrezzoCell` | `src/components/PrezzoCell.tsx` | collections con campo prezzo | ✅ | Cell custom per la list view |
| `InListaToggleCell` | `src/components/InListaToggleCell.tsx` | `Piatti.ts` | ✅ | Toggle interattivo nella lista |
| `ImportaFestivitaButton` | `src/components/ImportaFestivitaButton.tsx` | `Generali.ts` | ✅ | Importa festività italiane via `date-holidays` |
| `ScheduleWeeklyRowLabel` | `src/components/ScheduleWeeklyRowLabel.tsx` | `Generali.ts` | ✅ | RowLabel per giorni settimana |
| `CambioOrarioRowLabel` | `src/components/CambioOrarioRowLabel.tsx` | `Generali.ts` | ✅ | RowLabel per fasce orarie |
| `ChiusuraRowLabel` | `src/components/ChiusuraRowLabel.tsx` | `Generali.ts` | ✅ | RowLabel per eccezioni |
| `MenuItemRowLabel` | `src/components/MenuItemRowLabel.tsx` | `MenuConfig.ts` | ✅ | RowLabel per sezioni menu |

**Relazione `SaveDraftButtonWithCancel` ↔ `cancelButtonPlugin`**: il plugin `cancelButtonPlugin.ts` sostituisce il `SaveDraftButton` di default di Payload con `SaveDraftButtonWithCancel` su **tutte** le collections e globals. Il componente mostra il bottone "Annulla" accanto al "Salva come bozza".

---

### 6. Tailwind CSS v4 — ✅ Corretto (con nota)

| Aspetto | Stato | Note |
|---|---|---|
| `tailwind.config.ts` alla root | ✅ | Solo `content` paths, nessun tema JS |
| Tailwind applicato nell'admin | ✅ | Via `src/styles/payloadStyles.css` importato in `custom.scss` |
| Preflight disabilitato | ✅ | `/* @import 'tailwindcss/preflight.css' */` commentato in `payloadStyles.css` |
| Blocco `@theme` | ✅ | In `src/styles/payloadStyles.css` — mappa variabili `--payload-*` → `--theme-*` |
| Variabili `--payload-*` non sovrascrivono `--theme-*` | ✅ | `@theme` crea nuove variabili Tailwind che **referenziano** le variabili Payload |
| Dark mode via `data-theme="dark"` | ✅ | `@custom-variant dark` configurato |
| Interferenze con stili Payload | ⚠️ | `custom.scss` usa `!important` su `html`, `body`, headings — potenziale conflitto con future versioni Payload |

---

### 7. Smart Webhook — ✅ Completo

| Aspetto | Stato | Note |
|---|---|---|
| Fast Path (GCS upload) | ✅ | `uploadToGCSTarget()` implementato |
| Slow Path (Pub/Sub publish) | ✅ | `sendPubSubMessage()` implementato |
| Mock mode in development | ✅ | Attivo quando `NODE_ENV !== 'production'` |
| Context flag `skipSmartWebhook` | ✅ | Prevenzione loop infiniti |
| Graceful skip se bucket mancante | ✅ | Warning + skip, non errore fatale |
| Hook registrato in tutte le collections | ✅ | Via factory functions e collections dirette |
| Topic Pub/Sub | ✅ | `rebuild-menu` (hardcoded in `PUBSUB_TOPIC`) |
| Test su GCP | ⚠️ | Richiede `GCS_MENU_BUCKET` e `GCP_PROJECT_ID` configurati in Cloud Run |

---

### 8. Migrations — ✅ Allineato

- **13 migrazioni totali** — tutte registrate in `src/migrations/index.ts`
- **Ultima migrazione**: `20260301_163621_add_drafts_ordinamento_menu`
- **Nessuna anomalia**: ogni file `.ts` è registrato nell'index, nessun file orfano

---

## Debiti tecnici

### Priorità Alta

| ID | Problema | File | Impatto |
|---|---|---|---|
| DT-01 | `piattiOrderBy: 'order'` (e analoghi per tutte le sezioni) come `defaultValue` in `OrdinamentoMenu.ts` — il campo `order` è stato rimosso dalle collections | `src/globals/OrdinamentoMenu.ts` | Il frontend che usa `piattiOrderBy: 'order'` come parametro `sort` riceverà risultati non ordinati o errori |
| DT-02 | Rate limiting documentato in `API_REFERENCE.md` (1000/100 req/min) ma **non implementato** nel codice — nessun middleware trovato | `docs/dev/API_REFERENCE.md` | Documentazione fuorviante; nessun rate limiting in produzione |

### Priorità Media

| ID | Problema | File | Impatto |
|---|---|---|---|
| DT-03 | `LanguageToggle.tsx` esiste ma non è usato da nessun file | `src/components/LanguageToggle.tsx` | Componente orfano, dead code |
| DT-04 | `GoogleLoginButton.tsx` esiste ma non è importato da `LoginView.tsx` — `LoginView` ha il bottone inline | `src/components/GoogleLoginButton.tsx` | Componente orfano o duplicato |
| DT-05 | `docker-compose.yml` usa `node:18-alpine` mentre il Dockerfile di produzione usa `node:22.17.0-alpine` | `docker-compose.yml`, `Dockerfile` | Ambiente dev/prod divergente |
| DT-06 | `package.json` ha `"name": ""` (campo name vuoto) | `package.json` | Minore, ma non conforme alle best practice npm |
| DT-07 | `docs/ai/DOCS_INDEX.md` cita `generali` come "convertita da Global a Collection" — nel codice è un **Global** | `docs/ai/DOCS_INDEX.md` | Documentazione errata (già segnalato in `KB_BACKEND.md`) |

### Priorità Bassa

| ID | Problema | File | Impatto |
|---|---|---|---|
| DT-08 | `CancelButton.tsx` — da verificare se usato o sostituito completamente da `SaveDraftButtonWithCancel` | `src/components/CancelButton.tsx` | Potenziale dead code |
| DT-09 | `custom.scss` usa `!important` su elementi globali (`html`, `body`, headings) | `src/app/(payload)/custom.scss` | Potenziale conflitto con future versioni Payload |
| DT-10 | Nessuna configurazione MIME type per upload — Payload accetta tutti i tipi di file | `src/collections/Media.ts`, `MediaRistorante.ts` | Sicurezza: upload di file non immagine possibile |

---

## Stato per area funzionale

| Area | Stato | Note |
|---|---|---|
| Collections menu (22) | ✅ Completo | Tutte implementate con drafts, access, hooks |
| Globals (3) | ✅ Completo | generali, menu-config, ordinamento-menu |
| Google OAuth 2.0 | ✅ Completo | Flusso completo verificato |
| RBAC | ✅ Completo | admin/user, saveToJWT, access functions |
| Smart Webhook | ✅ Completo | Fast Path + Slow Path + Mock mode |
| GCS doppio bucket | ✅ Completo | gcsPluginMedia + gcsPluginMenuMedia |
| Tailwind CSS v4 admin | ✅ Corretto | Preflight disabilitato, @theme configurato |
| Endpoint migrazione dati | ✅ Completo | `/api/migrate-data` con `MigrationButton` |
| i18n admin (IT + EN) | ✅ Completo | |
| cancelButtonPlugin | ✅ Completo | Applicato a tutte le collections e globals |
| Rate limiting | ❌ Non implementato | Documentato ma assente nel codice |
| Email transazionali | ❌ Non implementato | Non richiesto (solo OAuth) |
| Multi-frontend (corporate, shop) | ⚠️ Parziale | Architettura pronta, target commentati come "futuri" |

---

## Roadmap (non implementato)

- Target frontend `corporate` e `shop` in `FRONTEND_TARGETS` (architettura già pronta)
- Rate limiting middleware
- Configurazione MIME type per upload
- Rimozione opzione `order` dai select di `OrdinamentoMenu` (DT-01)
