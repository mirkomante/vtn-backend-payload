/**
 * Tailwind CSS v4 Configuration
 * 
 * NOTA: Tailwind v4 usa un approccio CSS-first per la configurazione del tema.
 * La maggior parte della configurazione del tema (colori, spacing, ecc.) 
 * è stata spostata in src/app/(frontend)/tailwind.css usando @theme.
 * 
 * Questo file è mantenuto principalmente per:
 * - Specificare i content paths (file da scansionare)
 * - Documentazione delle scelte di configurazione
 * 
 * Il prefix 'tw-' è ora gestito direttamente nell'import CSS:
 * @import "tailwindcss" prefix(tw-);
 */

export default {
  // Content paths: scansiona solo componenti custom e frontend, NON Payload core
  content: [
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}
