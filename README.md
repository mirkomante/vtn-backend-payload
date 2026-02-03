# Sistema di Gestione Menu Ristorante (Backend Payload CMS)

Questo progetto è un backend completo basato su **Payload CMS 3.0** e **Next.js 15**, progettato per la gestione di menu digitali, carte dei vini e configurazioni per ristoranti.

## 🚀 Funzionalità Principali

Il sistema è strutturato in diverse aree funzionali gestite tramite Collections di Payload:

### 🍽️ Gestione Menu
- **Piatti**: Gestione dettagliata dei piatti con descrizioni, prezzi e associazioni.
- **Menu Fissi**: Creazione di menu degustazione o fissi.
- **Categorie Piatti**: Organizzazione gerarchica delle portate.
- **Categorie Menu Fisso**: Tipologie di menu fissi.

### 🍷 Gestione Cantina e Bevande
- **Vini**: Schede tecniche complete per vini (bianchi, rossi, rosati, bollicine).
- **Birre**: Gestione birre artigianali e industriali.
- **Cocktail**: Lista cocktail e ingredienti.
- **Liquori**: Gestione spirit e amari.
- **Bevande**: Acqua, bibite e caffetteria.

### ⚙️ Configurazioni e Impostazioni
- **Allergeni**: Gestione centralizzata degli allergeni per conformità normativa.
- **Zone, Nazioni, Regioni**: Gestione geografica per la provenienza dei prodotti (vini, materie prime).
- **Tipologie**: Classificazioni trasversali.
- **Servizi Accessori**: Gestione servizi extra.

### 👥 Utenti e Sicurezza
- **RBAC (Role-Based Access Control)**:
  - **Admin**: Accesso completo in lettura/scrittura su tutte le collezioni.
  - **Public/User**: Accesso in sola lettura ai contenuti pubblicati (`_status: 'published'`).
- **Autenticazione**: Gestione utenti sicura integrata in Payload.

## 🛠️ Stack Tecnologico

- **Core**: [Payload CMS 3.0](https://payloadcms.com) (Beta/RC versions)
- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: MongoDB (via Mongoose Adapter)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (integrato per componenti custom)
- **Language**: TypeScript

## 🏁 Quick Start

### Prerequisiti
- Node.js (v18 o superiore)
- MongoDB (locale o Atlas)
- Pnpm (consigliato) o Npm

### Installazione Locale

1.  **Clona il repository:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Configura le variabili d'ambiente:**
    Copia il file di esempio e configuralo:
    ```bash
    cp .env.example .env
    ```
    Assicurati di impostare `DATABASE_URI` (MongoDB connection string) e `PAYLOAD_SECRET`.

3.  **Installa le dipendenze:**
    ```bash
    pnpm install
    # oppure
    npm install
    ```

4.  **Avvia il server di sviluppo:**
    ```bash
    pnpm dev
    # oppure
    npm run dev
    ```
    > **Nota:** Se incontri problemi di cache con Next.js, puoi usare `npm run devsafe` per pulire la cache `.next` prima dell'avvio.

5.  **Accedi all'Admin Panel:**
    Apri [http://localhost:3000/admin](http://localhost:3000/admin) e crea il primo utente amministratore.

### Docker

È disponibile un file `docker-compose.yml` per avviare rapidamente l'ambiente con MongoDB locale.

```bash
docker-compose up -d
```

## 📂 Struttura del Progetto

```
src/
├── access/              # Logiche di controllo accessi (RBAC)
│   ├── menuImpostazioniAccess.ts
│   └── menuRistoranteAccess.ts
├── app/                 # Next.js App Router
│   ├── (frontend)/      # Pagine frontend pubbliche (attualmente placeholder)
│   └── (payload)/       # Pagine amministrative Payload
├── collections/         # Definizioni delle Collezioni (Schema Dati)
│   ├── factories/       # Factory functions per creare collezioni simili
│   └── fields/          # Field riutilizzabili (commonFields)
├── components/          # Componenti React Custom (Admin UI)
├── plugins/             # Plugin Payload custom
└── styles/              # Stili globali e integrazioni CSS
```

## 🎨 Integrazione Tailwind CSS

Il progetto utilizza **Tailwind CSS v4** per lo styling dei componenti custom dell'interfaccia di amministrazione.
Per dettagli sulla migrazione e l'utilizzo, consultare:
- [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

## 🤝 Contribuire

1.  Assicurati di seguire le regole definite in `.cursor/rules` se utilizzi Cursor IDE.
2.  Esegui sempre `npm run generate:types` dopo aver modificato le collezioni per aggiornare i tipi TypeScript.
3.  Utilizza i componenti Tailwind per nuove interfacce custom.

## 📄 Licenza

MIT
