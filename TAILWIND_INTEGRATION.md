# Integrazione Tailwind CSS v4 con Payload CMS

## ✅ Integrazione Completata

L'integrazione di Tailwind CSS v4 è stata completata con successo. Il sistema convive perfettamente con i CSS core di Payload CMS.

## 📋 Cosa è Stato Fatto

### 1. Installazione Dipendenze

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

**Versione installata:** Tailwind CSS v4.1.18

### 2. Configurazione PostCSS

File: `postcss.config.mjs`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // Nuovo plugin per Tailwind v4
    autoprefixer: {},
  },
}
```

**Nota importante:** Tailwind v4 richiede `@tailwindcss/postcss` invece del plugin `tailwindcss` diretto.

### 3. Configurazione CSS-First (Tailwind v4)

File: `src/app/(frontend)/tailwind.css`

Tailwind v4 usa un approccio CSS-first con:
- `@import "tailwindcss" prefix(tw);` invece di `@tailwind base/components/utilities`
- `@theme` per configurare colori, spacing, font, ecc. direttamente nel CSS

**Variabili Payload integrate:**

```css
@theme {
  --color-payload-bg: var(--theme-bg);
  --color-payload-text: var(--theme-text);
  --color-payload-border: var(--theme-border-color);
  --color-payload-elevation-100: var(--theme-elevation-100);
  /* ... e molte altre */
}
```

### 4. Configurazione TypeScript

File: `tailwind.config.ts`

Semplificato per v4 - specifica solo i `content` paths:

```typescript
export default {
  content: [
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}
```

### 5. Import nel Layout Frontend

File: `src/app/(frontend)/layout.tsx`

```typescript
import './tailwind.css'
import './styles.css'
```

### 6. Componenti Migrati

I seguenti componenti sono stati migrati da inline styles a Tailwind:

- ✅ `src/components/CancelButton.tsx`
- ✅ `src/components/LogoutButton.tsx`  
- ✅ `src/components/ThemeToggle.tsx`
- ✅ `src/components/LoginView.tsx` (pagina di login admin con Google OAuth)

## 📌 Configurazione Prefix

**Nessun prefix utilizzato** - Le classi Tailwind sono nella loro forma standard per massima compatibilità e leggibilità.

**Utilizzo delle classi:**

```tsx
// ✅ CORRETTO - Classi standard Tailwind
className="px-4 py-2 bg-transparent"
```

### Sintassi CSS Tailwind v4

Tailwind v4 usa:
- `@import "tailwindcss"` invece di `@tailwind`
- `@theme` invece di configurazione JavaScript
- Nessun prefix per mantenere le classi standard

## 🔐 LoginView: Pagina di Login Admin

La pagina di login dell'admin panel (`src/components/LoginView.tsx`) è stata completamente ridisegnata con Tailwind CSS v4.

### Design e Funzionalità

**Caratteristiche**:
- ✅ Login con Google OAuth 2.0
- ✅ Centrato verticalmente e orizzontalmente
- ✅ Nessuno scroll verticale indesiderato
- ✅ Supporto completo dark mode
- ✅ Usa variabili Payload per coerenza visiva

**Codice Tailwind**:

```tsx
export default function LoginView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-[var(--theme-bg)]">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <p className="text-[var(--theme-text)] text-base mb-2">
          Accedi al backend.
        </p>
        <a
          href="/api/users/oauth/google/authorize"
          className="inline-flex items-center justify-center gap-3 bg-[#4285F4] text-white px-7 py-3.5 rounded-lg no-underline text-base font-medium w-full transition-all duration-200 hover:bg-[#357ae8] hover:shadow-lg"
        >
          {/* Google Icon SVG */}
          Accedi con Google
        </a>
      </div>
    </div>
  )
}
```

### Fix Scroll Verticale

**Problema**: I wrapper generati automaticamente da Payload (`section.login`, `.template-minimal`, `.template-minimal__wrap`) aggiungono padding/margin di default che causano scroll verticale indesiderato.

**Soluzione**: Override CSS in `src/app/(payload)/custom.scss`:

```scss
// Fix per la pagina di login: rimuove scroll verticale e centra il contenuto
section.login,
.template-minimal,
.template-minimal__wrap {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 100vh !important;
  height: 100vh !important;
  overflow: hidden !important;
}
```

**Perché serve**:
- Payload genera automaticamente wrapper con stili di default
- Questi stili interferiscono con il centering Flexbox di Tailwind
- L'override forza i wrapper a comportarsi come contenitori neutri

### Testing

Per testare la LoginView:

```bash
pnpm dev
```

Poi apri:
- Light mode: http://localhost:3000/admin
- Dark mode: Switcha tema nell'admin panel

**Verifica che**:
- ✅ Nessuno scroll verticale presente
- ✅ Bottone centrato perfettamente (verticalmente e orizzontalmente)
- ✅ Funziona in entrambe le modalità (light/dark)
- ✅ Colori e spacing coerenti con il tema Payload

## 🎨 Come Usare le Variabili Payload

Le variabili CSS di Payload sono accessibili tramite utility classes:

### Colori

```tsx
// Background
className="bg-payload-elevation-100"
className="bg-payload-elevation-500"

// Testo
className="text-payload-text"

// Bordi
className="border-payload-border"

// Stati
className="bg-payload-success-500"
className="bg-payload-error-500"
className="bg-payload-warning-500"
```

### Spacing

```tsx
className="p-base"        // padding: var(--base)
className="m-base-2x"     // margin: calc(var(--base) * 2)
className="gap-gap"       // gap: var(--gap)
```

### Border Radius

```tsx
className="rounded-s-payload"  // border-radius: var(--border-radius-s)
className="rounded-m-payload"  // border-radius: var(--border-radius-m)
className="rounded-l-payload"  // border-radius: var(--border-radius-l)
```

### Font

```tsx
className="font-mono"           // font-family: var(--font-mono)
className="text-base-payload"   // font-size: var(--base-body-size)
```

## 🌓 Dark Mode

Il dark mode funziona automaticamente! Le variabili CSS di Payload (`--theme-*`) cambiano valore quando si switcha tema nell'Admin Panel, e le utility classes di Tailwind le referenziano direttamente.

**Non serve configurazione aggiuntiva** - tutto funziona out-of-the-box.

## 📁 Architettura CSS

```
┌─────────────────────────────────────────┐
│      Payload Admin Panel                │
│  • Usa CSS core di Payload              │
│  • custom.scss per override globali     │
│  • payloadStyles.css per Tailwind       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Frontend Next.js                   │
│  • Usa Tailwind CSS v4 (nessun prefix) │
│  • styles.css per stili custom          │
│  • Referenzia variabili Payload        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Componenti Custom Payload          │
│  • Usano Tailwind (nessun prefix)      │
│  • Referenziano variabili Payload       │
│  • Mantengono coerenza visiva           │
└─────────────────────────────────────────┘
```

## 🚀 Sviluppo

### Aggiungere Nuovi Componenti

```tsx
'use client'

export function MyComponent() {
  return (
    <div className="p-4 bg-payload-elevation-100 rounded-s-payload">
      <h2 className="text-payload-text font-medium">Titolo</h2>
      <button className="px-4 py-2 bg-payload-success-500 text-white hover:bg-payload-success-600">
        Click me
      </button>
    </div>
  )
}
```

### Build di Produzione

```bash
npm run build
```

La build compila correttamente. Gli eventuali warning ESLint sono pre-esistenti e non correlati a Tailwind.

### Dev Server

```bash
npm run dev
```

## ✅ Vantaggi dell'Integrazione

1. **Utility-first CSS** per sviluppo rapido
2. **Coerenza visiva automatica** tramite variabili Payload
3. **Dark mode funzionante** senza configurazione
4. **Zero conflitti** con CSS core di Payload (grazie al prefix)
5. **Type-safe** - le utility classes sono validate in build
6. **Performance** - CSS ottimizzato e tree-shaken

## 📚 Best Practices

### DO ✅

- Usa classi Tailwind standard senza prefix
- Referenzia variabili Payload per mantenere coerenza (`bg-payload-elevation-100`)
- Usa Tailwind sia nell'Admin Panel che nel frontend
- Testa sia light che dark mode

### DON'T ❌

- Non sovrascrivere il preflight di Tailwind nell'admin (già disabilitato)
- Non sovrascrivere variabili CSS di Payload con valori hardcoded
- Non usare `!important` a meno che strettamente necessario
- Non modificare direttamente gli stili core di Payload

## 🎯 Prossimi Passi (Opzionali)

1. Migrare altri componenti custom a Tailwind
2. Creare componenti riutilizzabili con Tailwind
3. Estendere il tema con colori/spacing custom se necessario
4. Aggiungere plugin Tailwind (forms, typography, ecc.) se serve

## 📝 Note Tecniche

- **Versione Tailwind:** 4.1.18 (latest)
- **Approccio:** CSS-first configuration
- **Prefix:** Nessuno (classi standard Tailwind)
- **PostCSS Plugin:** `@tailwindcss/postcss`
- **Build Status:** ✅ Compila con successo
- **Compatibilità:** Next.js 15.4.10, Payload CMS 3.72.0

## 🔗 Risorse

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Payload CSS Variables](https://payloadcms.com/docs/admin/customization#css-variables)
