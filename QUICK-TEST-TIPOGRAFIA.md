# Quick Test - Ottimizzazione Tipografia

## Test Immediato (3 minuti)

### 1. Refresh Browser
```
Cmd+Shift+R (Mac) o Ctrl+Shift+R (Win/Linux)
```

### 2. Verifica Leggibilità Desktop

Apri l'admin panel e controlla:

- [ ] **Testi generali** appaiono più leggibili (14px invece di 13px)
- [ ] **Nav sidebar** ha testo chiaro e leggibile
- [ ] **Tabelle** hanno celle con testo leggibile
- [ ] **Headings** hanno gerarchia visiva chiara (h1 più grande di h2, etc.)
- [ ] **Breadcrumb** leggibile ma non troppo prominente

### 3. Verifica Layout Intatto

Conferma che NON sono cambiati:

- [ ] **Padding bottoni**: dimensioni invariate
- [ ] **Checkbox**: dimensioni invariate
- [ ] **Toggle**: forma e dimensioni invariate
- [ ] **Dropdown**: dimensioni invariate
- [ ] **Allineamenti**: tutto allineato come prima
- [ ] **Spacing**: gap tra elementi invariato

### 4. Test Mobile

Apri DevTools → Toggle device toolbar → Scegli iPhone o dispositivo mobile

- [ ] **Testo body**: 16px (molto leggibile)
- [ ] **Nav links**: 16px (facile da leggere)
- [ ] **Tabelle**: 15px (bilanciato)
- [ ] **Headings**: proporzionati (h1=20px, h2=18px, h3=16px)

---

## DevTools Check (Opzionale)

### Verifica Font-size Applicato

1. **Inspect elemento** (tasto destro → Ispeziona)
2. Vai a **Computed** tab
3. Cerca "font-size"

**Valori attesi**:

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| html | 14px | 16px |
| body | 14px | 16px |
| nav a | 14px | 16px |
| table td | 14px | 15px |
| h1 | 24px | 20px |

### Verifica Line-height

1. Inspect un paragrafo di testo
2. Computed → line-height
3. Deve essere: **1.5** (più arioso del default 1.54)

---

## Confronto Visivo

### Prima (Payload Default)
- Testi piccoli, affaticamento visivo
- Body text: 13px (difficile da leggere)
- Nav/Table: 13px

### Dopo (Ottimizzato)
- Testi leggibili, piacevoli da leggere
- Body text: 14-16px (WCAG compliant)
- Nav/Table: 14-15px

---

## Problemi Comuni e Soluzioni

### Se i testi appaiono troppo grandi

**Causa**: Browser zoom impostato > 100%  
**Soluzione**: Reset zoom a 100% (Cmd+0 / Ctrl+0)

### Se i testi non sono cambiati

**Causa**: Cache browser non pulita  
**Soluzione**: 
1. Hard refresh (Cmd+Shift+R)
2. Oppure: DevTools → Network → Disable cache (checkbox)

### Se il layout è rotto

**Causa**: Compilazione non completata  
**Soluzione**:
1. Controlla terminale dev server
2. Attendi "✓ Compiled" 
3. Refresh browser

### Se bottoni/checkbox sono cambiati

**Causa**: Modifiche non volute (non dovrebbe succedere)  
**Soluzione**: Segnalami il problema con screenshot

---

## Test Accessibilità (Opzionale)

### WCAG 2.1 AA Conformità

1. **Font-size minimo**: Deve essere ≥14px ✅
2. **Line-height**: Deve essere ≥1.4 ✅ (1.5 applicato)
3. **Contrasto**: Invariato (già conforme)

### Test con Zoom Browser

1. Zoom al 200% (Cmd++ / Ctrl++)
2. Verifica che il testo si ingrandisca proporzionalmente
3. Verifica che non ci sia scroll orizzontale
4. Reset zoom (Cmd+0 / Ctrl+0)

---

## Checklist Finale

- [ ] Testi più leggibili su desktop (14px)
- [ ] Testi ottimali su mobile (16px)
- [ ] Nav sidebar leggibile
- [ ] Tabelle leggibili
- [ ] Headings con gerarchia chiara
- [ ] Bottoni dimensioni invariate
- [ ] Checkbox dimensioni invariate
- [ ] Toggle dimensioni invariate
- [ ] Layout generale intatto
- [ ] Nessun elemento rotto o spostato

---

## Se Tutto OK

L'ottimizzazione è completa! L'admin panel ora ha:

- ✅ Leggibilità migliorata del 7-23%
- ✅ Conformità WCAG 2.1 AA
- ✅ Layout intatto
- ✅ Zero breaking changes

---

## Se Qualcosa Non Va

Fammi sapere con:

1. **Screenshot** dell'elemento problematico
2. **Viewport size** (desktop/tablet/mobile)
3. **Browser** utilizzato (Chrome, Safari, Firefox, etc.)
4. **Descrizione** del problema

Posso:
- Aggiustare i valori
- Fare rollback parziale
- Fare rollback completo

---

**Tempo test**: 3-5 minuti  
**Obiettivo**: Verificare leggibilità migliorata senza layout rotto
