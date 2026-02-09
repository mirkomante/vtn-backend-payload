# Fix Checkbox Mobile - Aggiornato con Dimensioni Esatte

**Data**: 9 Febbraio 2026  
**File modificato**: `src/app/(payload)/custom.scss`  
**Dimensioni**: 20.453125px (misurate da screenshot)

---

## Modifica Implementata

Basandomi sullo screenshot fornito dall'utente, ho applicato le dimensioni esatte:

```scss
@include small-break {
  .checkbox-input__input {
    width: 20.453125px !important;
    height: 20.453125px !important;
  }
  
  .checkbox-input__icon {
    width: 20.453125px !important;
    height: 20.453125px !important;
    
    .icon--line {
      width: 18px !important;
      height: 18px !important;
    }
  }
}
```

---

## Dimensioni Applicate (Mobile)

| Elemento | Dimensione | Note |
|----------|------------|------|
| **Container checkbox** | 20.453125px | Container esterno |
| **Icona wrapper** | 20.453125px | Wrapper icona SVG |
| **Checkmark (SVG)** | 18px | Icona checkmark interna |

---

## Confronto Prima/Dopo

### Prima
- Container: 20px (default $baseline)
- Icona: 22.4px (1.4rem con html 16px)
- **Problema**: Icona troppo grande

### Dopo
- Container: **20.453125px** (esatto da screenshot)
- Icona wrapper: **20.453125px**
- Checkmark: **18px** (centrato)
- **Risultato**: Dimensioni identiche allo screenshot

---

## Verifica DevTools

Per confermare che le dimensioni siano applicate:

1. Apri DevTools mobile view (iPhone size)
2. Inspect checkbox
3. Computed styles:
   - `.checkbox-input__input`: `20.453125px × 20.453125px`
   - `.checkbox-input__icon`: `20.453125px × 20.453125px`
   - `.icon--line`: `18px × 18px`

---

**Status**: ✅ Aggiornato con dimensioni esatte da screenshot
