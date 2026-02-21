# Quick Test - Fix Checkbox Mobile

## Test Immediato (2 minuti)

### 1. Apri DevTools Mobile View

```
Cmd+Option+I (Mac) o F12 (Win/Linux)
Cmd+Shift+M (Mac) o Ctrl+Shift+M (Win/Linux)
```

Seleziona dispositivo mobile (es. iPhone 12, Galaxy S20)

### 2. Vai a una List View

Esempio: Collections → Piatti (o qualsiasi altra collection)

### 3. Verifica Checkbox

- [ ] **Checkbox dimensioni corrette** (non troppo grandi)
- [ ] **Icona checkmark proporzionata** al container
- [ ] **Touch target funzionante** (20x20px)
- [ ] **Selezione funziona** correttamente

### 4. Confronto Visivo

**Prima del fix**:
- Icona checkmark troppo grande (22.4px)
- Icona sporgeva fuori dal container
- Aspetto non uniforme

**Dopo il fix**:
- Icona checkmark dimensioni standard (18px)
- Icona perfettamente centrata
- Aspetto Payload default

---

## DevTools Check Dettagliato

### Verifica Dimensioni Applicate

1. **Inspect checkbox** (click destro → Ispeziona)
2. Trova elemento `.checkbox-input__icon .icon--line`
3. Vai a tab **Computed**
4. Cerca `width` e `height`

**Valori attesi**:
```
width: 18px
height: 18px
```

**Se vedi invece**:
- `22.4px` → Fix non applicato (refresh con Cmd+Shift+R)
- `1.4rem` → Stile non overridden (verifica CSS)

### Verifica Breakpoint Applicato

1. Inspect checkbox
2. Tab **Styles**
3. Cerca `.icon--line`
4. Dovresti vedere:
   ```scss
   @media (max-width: 768px)
   .checkbox-input__icon .icon--line {
     width: 18px !important;
     height: 18px !important;
   }
   ```

---

## Test su Viewport Diverse

### Desktop (>1024px)
- [ ] Checkbox invariati
- [ ] Icona ~19.6px (1.4rem con html 14px)

### Tablet (768-1024px)
- [ ] Checkbox invariati
- [ ] Icona ~21px (1.4rem con html 15px)

### Mobile (<=768px)
- [ ] Checkbox icona **forzata a 18px**
- [ ] Aspetto uniforme con Payload default

---

## Problemi Comuni

### Se l'icona è ancora troppo grande

**Causa**: Browser cache  
**Soluzione**: Hard refresh (Cmd+Shift+R o Ctrl+Shift+R)

### Se l'icona è troppo piccola

**Causa**: Fix applicato ma dimensione non ottimale  
**Soluzione**: Aumenta valore in `custom.scss`:
```scss
width: 19px !important;   // Prova 19px o 20px
height: 19px !important;
```

### Se desktop è cambiato

**Causa**: Override applicato anche a desktop (errore)  
**Soluzione**: Verifica che `@include small-break` sia presente (solo mobile)

---

## Checklist Finale

- [ ] Mobile: checkbox icona 18px
- [ ] Desktop: checkbox invariati
- [ ] Tablet: checkbox invariati
- [ ] Touch target funzionante (20x20px)
- [ ] Selezione checkbox funziona
- [ ] Checkmark centrato nel container
- [ ] Tipografia ancora ottimizzata (14-16px)
- [ ] Nessun altro elemento cambiato

---

## Valori di Riferimento

| Viewport | Container | Icona | Font-size HTML |
|----------|-----------|-------|----------------|
| Desktop  | 20x20px   | ~19.6px | 14px |
| Tablet   | 20x20px   | ~21px | 15px |
| Mobile   | 20x20px   | **18px** | 16px |

**Nota**: Icona mobile forzata a 18px per annullare scaling da 16px font-size

---

## Se Tutto OK

Il fix è completo! Checkbox mobile sono tornati alle dimensioni Payload default senza compromettere:

- ✅ Tipografia ottimizzata (14-16px)
- ✅ Layout invariato
- ✅ Altri elementi UI invariati
- ✅ Desktop/Tablet invariati

---

**Tempo test**: 2-3 minuti  
**Obiettivo**: Verificare checkbox mobile dimensioni corrette
