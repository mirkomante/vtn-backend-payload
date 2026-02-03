import { createBevandaCollection } from './factories/createBevandaCollection'

export const Vino = createBevandaCollection({
  slug: 'vini',
  singular: 'Vino',
  plural: 'Vini',
  tipologiaSlug: 'tipologie-vino',
  defaultColumns: ['nome', 'inLista', 'cantina', 'nazione', 'prezzo', '_status'],
  campiAggiuntivi: {
    grado: true,
    capacita: true,
    cantina: true,
    certificazione: true,
    prezzoCalice: true,
    regioneZona: true, // Vino ha regione e zona
  },
})
