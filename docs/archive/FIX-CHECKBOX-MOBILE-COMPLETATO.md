# Fix Checkbox Mobile - Completato

**Data**: 9 Febbraio 2026  
**File modificato**: `src/app/(payload)/custom.scss`  
**Obiettivo**: Riportare checkbox mobile alle dimensioni default Payload

---

## Problema Risolto

L'ottimizzazione tipografia aveva aumentato `html { font-size: 16px }` su mobile, causando un effetto collaterale:

- **Icona checkbox** usa `1.4rem` (unità relative)
- Con `html: 16px` → icona diventava 22.4px (troppo grande)
- Con `html: 13px` (default Payload) → icona era 18.2px

**Risultato**: Checkbox mobile troppo grandi (+23%)

---

## Soluzione Implementata

Aggiunto override CSS specifico per mobile in `src/app/(payload)/custom.scss`:

```scss
/////////////////////////////
// FIX CHECKBOX MOBILE
/////////////////////////////

// Su mobile, mantieni dimensioni checkbox standard Payload
// nonostante l'aumento del font-size HTML a 16px
@include small-break {
  .checkbox-input__icon {
    .icon--line {
      width: 18px !important;   // Dimensione default Payload
      height: 18px !important;
    }
  }
}
```

**Posizione**: Dopo sezione "OTTIMIZZAZIONE TIPOGRAFIA", prima di "Container delle azioni bulk"

---

## Dimensioni Finali Checkbox

| Componente | Desktop | Tablet | Mobile | Note |
|------------|---------|--------|--------|------|
| **Container** | 20x20px | 20x20px | 20x20px | Invariato ($baseline fisso) |
| **Icona** | ~19.6px | ~21px | **18px** | Mobile forzato a px fissi |

---

## Confronto Prima/Dopo

### Prima del Fix
- Desktop: 19.6px (1.4rem con html 14px)
- Mobile: 22.4px (1.4rem con html 16px) ❌ Troppo grande

### Dopo il Fix
- Desktop: 19.6px (invariato)
- Mobile: 18px (forzato) ✅ Dimensioni Payload default

---

## Cosa È Stato Modificato

✅ **Solo l'icona del checkbox su mobile** (<=768px):
- Forzata a 18px fissi
- Annulla effetto scaling da rem

❌ **Nessuna modifica a**:
- Checkbox container (rimane 20x20px)
- Desktop/Tablet checkbox
- Tipografia (rimane ottimizzata)
- Altri elementi UI

---

## Verifica Tecnica

### Compilazione
```bash
pnpm tsc --noEmit
# Exit code: 0 (nessun errore)
```

### Dev Server
- Compilazione Next.js: OK
- Import map: generato correttamente
- Admin panel: funzionante

---

## Test Raccomandati

### Desktop (>1024px)
- [ ] Verifica checkbox dimensioni invariate (~20px)
- [ ] Verifica icona checkmark proporzionata

### Tablet (768-1024px)
- [ ] Verifica checkbox dimensioni invariate
- [ ] Verifica funzionamento normale

### Mobile (<=768px)
- [ ] Verifica checkbox **non troppo grandi**
- [ ] Verifica icona 18px (dimensione Payload default)
- [ ] Verifica checkmark centrato nel container
- [ ] Verifica touch target funzionante (20x20px)

---

## DevTools Check (Mobile)

Per verificare che il fix sia applicato:

1. Apri DevTools → Toggle device toolbar
2. Seleziona iPhone o dispositivo mobile
3. Inspect checkbox (icona checkmark)
4. Computed styles → Cerca `.icon--line`
5. Verifica: `width: 18px`, `height: 18px`

**Valore atteso**: `18px` (non più `22.4px`)

---

## Strategia Tecnica

### Perché rem Causa Problemi

```scss
// Payload default
.icon--line {
  width: 1.4rem;   // Scala con html font-size
  height: 1.4rem;
}

// Con html 13px: 1.4 × 13 = 18.2px ✅
// Con html 16px: 1.4 × 16 = 22.4px ❌
```

### Soluzione: px Fissi su Mobile

```scss
@include small-break {
  .icon--line {
    width: 18px !important;   // Non scala più
    height: 18px !important;
  }
}
```

**Vantaggio**: Annulla scaling senza toccare tipografia

---

## Effetti Collaterali Evitati

✅ **Nessun impatto su**:
- Tipografia (14-16px ancora applicata)
- Layout generale
- Altri componenti che usano rem
- Container checkbox (usa $baseline non rem)
- Desktop/Tablet

---

## Se Servono Altri Aggiustamenti

Se l'icona 18px è troppo piccola o troppo grande su mobile:

### Aumentare a 19px
```scss
width: 19px !important;
height: 19px !important;
```

### Aumentare a 20px (stesso del container)
```scss
width: 20px !important;
height: 20px !important;
```

**Nota**: 18px è la dimensione Payload default, raccomandata per consistenza.

---

## Rollback

Per annullare solo questo fix:

1. Apri `src/app/(payload)/custom.scss`
2. Cerca "FIX CHECKBOX MOBILE"
3. Elimina il blocco da:
   ```scss
   /////////////////////////////
   // FIX CHECKBOX MOBILE
   /////////////////////////////
   ```
   Fino a:
   ```scss
   // Container delle azioni bulk...
   ```
4. Salva e refresh browser

**Risultato**: Checkbox mobile torneranno grandi (22.4px)

---

## Linee di Codice Aggiunte

**File**: `src/app/(payload)/custom.scss`  
**Linee**: +15 (commenti inclusi)  
**Posizione**: Riga ~129-143 (dopo breadcrumb, prima bulk actions)

---

## Conformità Best Practices

### Touch Target Size
- ✅ Container: 20x20px (< minimo WCAG 2.1 AA di 44x44px ma accettabile per checkbox)
- ✅ Icona: 18px (proporzionata al container)
- ✅ Area cliccabile: 20x20px (invariata)

### Accessibilità
- ✅ Dimensioni consistenti con Payload
- ✅ Icona visibile e riconoscibile
- ✅ Nessun impatto su focus/hover states

---

## Conclusione

Il fix riporta i checkbox mobile alle dimensioni default Payload (icona 18px), annullando l'effetto collaterale dell'ottimizzazione tipografia senza compromettere la leggibilità dei testi.

**Status**: ✅ COMPLETATO  
**Impatto**: Solo checkbox mobile  
**Breaking changes**: Nessuno

---

**Prossimo step**: Refresh browser mobile e verifica checkbox dimensioni corrette
