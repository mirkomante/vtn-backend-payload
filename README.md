# Sistema di Gestione Menu Ristorante (Backend Payload CMS)

Questo progetto è un backend completo basato su **Payload CMS 3.0** e **Next.js 15**, progettato per la gestione di menu digitali, carte dei vini e configurazioni per ristoranti.

## 📂 Struttura della Documentazione

La documentazione è stata riorganizzata per facilitare la navigazione:

### 👩‍💻 Per Sviluppatori
- **[Guida allo Sviluppo Locale](./docs/dev/GETTING_STARTED.md)**: Setup, installazione e avvio.
- **[Riferimento API](./docs/dev/API_REFERENCE.md)**: Dettagli su endpoint REST e GraphQL.
- **[Troubleshooting](./docs/dev/TROUBLESHOOTING.md)**: Risoluzione problemi comuni (es. pagina bianca su Cloud Run).
- **[Integrazione Tailwind](./docs/dev/TAILWIND_INTEGRATION.md)**: Guida allo styling dell'admin panel.
- **[Guide di Migrazione](./docs/dev/MIGRATION_GUIDE.md)**: Storico delle migrazioni e guide.

### 🤖 Per Agenti AI
- **[Context & Regole (AGENTS.md)](./docs/ai/AGENTS.md)**: Contesto del progetto, regole di sviluppo e struttura del database.
- **[Docs Index](./docs/ai/DOCS_INDEX.md)**: Indice navigabile per l'ingestione automatica.

### 📦 Archivio
- **[Archivio Task](./docs/archive/)**: Log di task completati e test passati.

## Stack Tecnologico

- **Core**: [Payload CMS 3.74](https://payloadcms.com)
- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Storage**: Google Cloud Storage per i media
- **Hosting**: Google Cloud Run
- **CI/CD**: Cloud Build con GitHub connector
- **Language**: TypeScript

## Deploy

Il deploy avviene automaticamente su Google Cloud Run tramite Cloud Build al push sul branch `main`.
Vedi la [Guida allo Sviluppo](./docs/dev/GETTING_STARTED.md) per dettagli sulle variabili d'ambiente di produzione.

## Licenza

MIT
