/**
 * Tailwind CSS v4 Configuration
 * 
 * NOTA: Tailwind v4 usa un approccio CSS-first per la configurazione del tema.
 * La maggior parte della configurazione del tema (colori, spacing, ecc.) 
 * è stata spostata in src/app/(frontend)/tailwind.css e src/styles/payloadStyles.css usando @theme.
 * 
 * Questo file è mantenuto principalmente per:
 * - Specificare i content paths (file da scansionare)
 * - Documentazione delle scelte di configurazione
 * 
 * Nessun prefix è utilizzato per mantenere le classi standard di Tailwind.
 */

export default {
  // Content paths: scansiona componenti custom, frontend e admin panel
  content: [
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/(payload)/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}
