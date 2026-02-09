# Valori Tipografia Applicati - Quick Reference

## Tabella Completa Font-size

| Elemento | Desktop (>1024px) | Tablet (768-1024px) | Mobile (<=768px) | Line-height |
|----------|-------------------|---------------------|------------------|-------------|
| **html** | 14px | 15px | 16px | - |
| **body** | 14px | 15px | 16px | 1.5 |
| **h1** | 24px | 24px | 20px | 1.3 |
| **h2** | 20px | 20px | 18px | 1.4 |
| **h3** | 18px | 18px | 16px | 1.4 |
| **h4, h5, h6** | 14px | 14px | 14px | 1.5 |
| **nav a** | 14px | 15px | 16px | 1.5 |
| **table cells** | 14px | 14px | 15px | 1.5 |
| **breadcrumb** | 13px | 13px | 14px | 1.5 |

---

## Incremento da Default Payload

| Elemento | Default Payload | Nuovo Desktop | Nuovo Mobile | Incremento |
|----------|-----------------|---------------|--------------|------------|
| **Body** | 13px | 14px | 16px | +7-23% |
| **Nav** | 13px | 14px | 16px | +7-23% |
| **Table** | 13px | 14px | 15px | +7-15% |
| **H1** | ~21px | 24px | 20px | +14% |
| **H2** | ~17px | 20px | 18px | +17% |
| **H3** | ~15px | 18px | 16px | +20% |

---

## Breakpoints Utilizzati

```scss
// Desktop (default)
> 1024px: 14px base

// Tablet
@include mid-break {  // 768px - 1024px
  15px base
}

// Mobile
@include small-break {  // <= 768px
  16px base
}
```

---

## CSS Selettori Utilizzati

### Elementi di Base
```scss
html { font-size: 14-16px }
body { font-size: 14-16px, line-height: 1.5 }
```

### Headings
```scss
h1 { font-size: 20-24px, line-height: 1.3 }
h2 { font-size: 18-20px, line-height: 1.4 }
h3 { font-size: 16-18px, line-height: 1.4 }
h4, h5, h6 { font-size: 14px, line-height: 1.5 }
```

### Componenti UI
```scss
nav a { font-size: 14-16px, line-height: 1.5 }
[class*='cell'], .table td, .table th { font-size: 14-15px, line-height: 1.5 }
[class*='breadcrumb'], .breadcrumbs { font-size: 13-14px, line-height: 1.5 }
```

---

## Line-height Standard

**1.5** per tutti gli elementi (eccetto headings con 1.3-1.4)

**Motivazione**:
- WCAG 2.1 raccomanda: ≥1.4
- Material Design usa: 1.5
- Apple HIG usa: 1.4-1.6

**Risultato**: Testo più arioso e leggibile

---

## Confronto Best Practices

### WCAG 2.1 AA (Accessibilità)
- ✅ Raccomandato: 14-16px → **Applicato**: 14-16px
- ✅ Line-height: ≥1.4 → **Applicato**: 1.5
- ✅ Contrasto: Invariato (già conforme)

### Material Design
- ✅ Body: 14px desktop, 16px mobile → **Applicato**: 14-16px
- ✅ Headings: 14-24px → **Applicato**: 14-24px
- ✅ Line-height: 1.5 → **Applicato**: 1.5

### Apple HIG
- ⚠️ Body iOS: 17px → **Applicato**: 16px (web-optimized)
- ✅ Line-height: 1.4-1.6 → **Applicato**: 1.5

---

## Cosa NON è Stato Modificato

**Padding/Margin**: Invariati
- Bottoni: nessuna modifica padding
- Checkbox: nessuna modifica dimensioni
- Toggle: nessuna modifica gap
- Dropdown: nessuna modifica padding
- Nav: nessuna modifica spacing

**Display/Layout**: Invariati
- Flex properties
- Grid properties
- Allineamenti
- Posizionamento

**Altro**: Invariati
- Colori
- Borders
- Shadows
- Animations
- Z-index

---

## Formule di Conversione

### Da px a rem (se necessario)
```
1rem = 16px (browser default)

Con html { font-size: 14px }:
1rem = 14px
```

### Da px a em (relativo al parent)
```
2em = 2 × parent font-size
```

**Nota**: Stiamo usando `px` con `!important` per sovrascrivere Payload e garantire precisione.

---

## DevTools Computed Values

Dopo l'applicazione, questi sono i valori che dovresti vedere in DevTools → Computed:

**Desktop**:
```
html: font-size: 14px
body: font-size: 14px, line-height: 21px (1.5 × 14)
nav a: font-size: 14px, line-height: 21px
```

**Mobile**:
```
html: font-size: 16px
body: font-size: 16px, line-height: 24px (1.5 × 16)
nav a: font-size: 16px, line-height: 24px
```

---

## File Modificato

**Path**: `src/app/(payload)/custom.scss`

**Linee**: Aggiunte ~60 linee di CSS nella sezione "OTTIMIZZAZIONE TIPOGRAFIA"

**Posizione**: Dopo fix login, prima di `.list-selection__actions`

---

## Rollback Rapido

Se serve annullare solo la tipografia:

1. Apri `src/app/(payload)/custom.scss`
2. Cerca "OTTIMIZZAZIONE TIPOGRAFIA"
3. Elimina tutto il blocco da:
   ```scss
   /////////////////////////////
   // OTTIMIZZAZIONE TIPOGRAFIA
   /////////////////////////////
   ```
   Fino a:
   ```scss
   // Container delle azioni bulk...
   ```
4. Salva e refresh browser

---

**Ultima modifica**: 9 Febbraio 2026  
**Status**: ✅ Applicato e funzionante
