# 📝 Kaip Naudoti Cursor AI Prompt'us

## 🎯 Turime 2 Prompt'us

### 1. **CURSOR_AI_PROMPT.md** (Pilnas, Išsamus)
**Dydis:** ~15,000 žodžių  
**Laikas skaityti:** 30-45 min  
**Kada naudoti:**
- ✅ Pradedi projektą nuo nulio
- ✅ Nori pilną dokumentaciją
- ✅ Reikia detalių techninių specifikacijų
- ✅ Keli programuotojai dirba projekte
- ✅ Nori suprasti visus aspektus

**Apima:**
- Pilną verslo kontekstą
- Detalią duomenų struktūrą
- Visus API endpoints
- UI/UX gaires
- Deployment instrukcijas
- Best practices
- Testavimo scenarijus
- Troubleshooting

---

### 2. **CURSOR_PROMPT_SHORT.md** (Trumpas, Kompaktiškas)
**Dydis:** ~2,000 žodžių  
**Laikas skaityti:** 5-10 min  
**Kada naudoti:**
- ✅ Greitam prototipui
- ✅ Jau turi projekto pagrindą
- ✅ Reikia tik esminių dalykų
- ✅ Cursor chat'e (lengviau nukopijuoti)
- ✅ Greitam priminimui

**Apima:**
- Pagrindinį tikslą
- Stack'ą
- Kritinius komponentus
- Svarbiausia workflow
- Demo duomenis
- Sėkmės kriterijus

---

## 🚀 Kaip Naudoti su Cursor AI

### Metodas 1: Tiesioginis Kopijavimas (Rekomenduojamas)

1. **Atidaryti failą:**
   ```bash
   # Trumpas variantas
   cat CURSOR_PROMPT_SHORT.md
   
   # Arba pilnas
   cat CURSOR_AI_PROMPT.md
   ```

2. **Nukopijuoti visą turinį** (Ctrl+A, Ctrl+C)

3. **Cursor AI chat'e** įklijuoti ir pridėti:
   ```
   [ĮKLIJUOTAS PROMPT]
   
   Pradėk kurti šį projektą pagal aukščiau aprašytą specifikaciją.
   Pradėk nuo backend setup ir produktų paieškos API endpoint'o.
   ```

### Metodas 2: Nuoroda į Failą

Cursor chat'e:
```
@CURSOR_AI_PROMPT.md 

Perskaityk šį dokumentą ir sukurk visą sistemą pagal aprašytą specifikaciją.
Prioritetas #1: ULTRA greitas produktų įvedimas.
```

### Metodas 3: Etapinis Darbas

**Etapas 1 - Backend:**
```
@CURSOR_AI_PROMPT.md 

Perskaityk sekciją "Backend Foundation" ir "API Endpoints".
Sukurk Express serverį su:
- SQLite database
- Auth sistema (JWT + PIN)
- Products search endpoint (KRITINIS!)
- Transactions endpoint
```

**Etapas 2 - Frontend:**
```
@CURSOR_AI_PROMPT.md 

Perskaityk sekciją "ULTRA GREITAS ĮVEDIMAS".
Sukurk React komponentus:
- ProductSearchInput (real-time search)
- QuantityInput (auto-focus)
- FastProductEntry (workflow)
```

**Etapas 3 - Integravimas:**
```
@CURSOR_AI_PROMPT.md 

Integruok frontend su backend.
Testuok ULTRA greito įvedimo workflow.
Pridėk PIN patvirtinimą.
```

---

## 💡 Patarimai

### ✅ Gera Praktika

**Specifiški Klausimai:**
```
Man reikia sukurti ProductSearchInput komponentą.
Jis turi ieškoti produktų pagal kodą, barkodą ir pavadinimą.
Real-time search su debounce 300ms.
Arrow klavišai navigacijai.
ENTER pasirinkimui.

Žiūrėk CURSOR_AI_PROMPT.md sekciją "PRODUKTŲ PAIEŠKA".
```

**Testavimas:**
```
Testuoju greito įvedimo workflow.
Produkto pasirinkimas veikia, bet fokusas negrįžta į paieškos laukelį.

Patikrink CURSOR_AI_PROMPT.md sekciją "FOKUSO VALDYMAS" ir padėk sutvarkyti.
```

**Bug Fixing:**
```
PIN patvirtinimas neveikia - visada grąžina "Neteisingą PIN".

Žiūrėk CURSOR_AI_PROMPT.md sekciją "PIN PATVIRTINIMAS" 
ir patikrink ar bcrypt compare'inimas teisingas.
```

### ❌ Bloga Praktika

**Per Bendras:**
```
❌ Sukurk man sistemą
❌ Padaryk viską
❌ Kodas neveikia, pataisyk
```

**Per Daug Detalių:**
```
❌ [Kopijuoji 5000 eilučių kodo]
❌ Štai visas kodas, rask klaidą
```

---

## 🎯 Specifiniai Scenarijai

### Scenarijus 1: Nauja Funkcija
**Situacija:** Noriu pridėti produktų kategorijų filtravimą.

**Cursor AI Prompt:**
```
Žiūrėk CURSOR_AI_PROMPT.md duomenų struktūrą.
Products lentelė turi 'category' lauką.

Pridėk:
1. Backend: GET /api/products?category=:category endpoint
2. Frontend: Dropdown su kategorijomis TakeProducts puslapyje
3. Filtruok paieškos rezultatus pagal pasirinktą kategoriją

Išlaikyk ULTRA greito įvedimo workflow!
```

### Scenarijus 2: Performance Problema
**Situacija:** Paieška lėta kai daug produktų.

**Cursor AI Prompt:**
```
Produktų paieška lėtėja kai >1000 produktų.
Dabartinis kodas: [pateiki SQL užklausą]

Žiūrėk CURSOR_AI_PROMPT.md sekciją "DUOMENŲ BAZĖS SCHEMA".
Patikrink ar yra indexes ant code, barcode, name.
Optimizuok search endpoint'ą.
Pridėk LIMIT 10 jei dar nėra.
```

### Scenarijus 3: UI Pagerinimas
**Situacija:** Noriu gražesnio krepšelio dizaino.

**Cursor AI Prompt:**
```
Krepšelio UI atrodo per paprastas.

Žiūrėk CURSOR_AI_PROMPT.md sekciją "UI/UX DIZAINO PRINCIPAI".
Naudok TailwindCSS spalvas ir spacing.
Pridėk:
- Card dizainą
- Hover effects
- Edit/Delete mygtukus su icons
- Bendra suma footer'yje

Išlaikyk responsive dizainą!
```

---

## 📊 Kada Kuris Prompt

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Pradedi projektą      → PILNAS PROMPT          │
│  nuo nulio?                                     │
│                                                 │
│  Greitai noriu         → TRUMPAS PROMPT         │
│  prototipą?                                     │
│                                                 │
│  Reikia detalės        → PILNAS PROMPT          │
│  specifikacijos?           (specifinė sekcija)  │
│                                                 │
│  Papildai funkciją?    → TRUMPAS PROMPT +       │
│                           nuoroda į pilną       │
│                                                 │
│  Taisai bug'ą?         → TRUMPAS PROMPT +       │
│                           code snippet          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔥 Geriausi Promptai Įvairioms Užduotims

### Backend Setup
```
@CURSOR_AI_PROMPT.md 

Sukurk backend pagal "Backend Foundation" sekciją:
1. Express serveris su CORS
2. SQLite database su schema iš "DUOMENŲ BAZĖS SCHEMA"
3. JWT auth middleware
4. bcrypt PIN hashing
5. Seed skriptas demo duomenims

Testuok su: npm run dev
```

### Produktų Paieška (KRITINIS!)
```
@CURSOR_AI_PROMPT.md 

Įgyvendink "PRODUKTŲ PAIEŠKA" sekciją:
1. GET /api/products/search?q=:query endpoint
2. SQL paieška pagal code/barcode/name
3. Grąžinti top 10 rezultatų
4. Sortavimas: exact match > partial match

Response: [{ id, code, barcode, name, unit, stock, price }]
```

### Ultra Greitas Įvedimas
```
@CURSOR_AI_PROMPT.md 

Sukurk "GREITO ĮVEDIMO KOMPONENTAS" pagal sekciją:

1. ProductSearchInput.tsx:
   - Real-time search (debounce 300ms)
   - Arrow Up/Down navigacija
   - ENTER pasirinkimui
   - Dropdown su rezultatais

2. QuantityInput.tsx:
   - Auto-focus
   - ENTER submit
   - Number type
   - Step pagal unit

3. FastProductEntry.tsx:
   - Sujungia abu komponentus
   - Auto-focus management
   - Cart valdymas

TESTUOK: 10 prekių per 20 sekundžių!
```

### PIN Sistema
```
@CURSOR_AI_PROMPT.md 

Įgyvendink PIN patvirtinimą:

1. Backend: POST /api/auth/verify-pin
   - Input: { userId, pin }
   - bcrypt compare
   - Return: { success: boolean }

2. Frontend: PinModal.tsx
   - 4 input laukai
   - Auto-focus pereiti
   - Type password
   - Submit kai visi 4 įvesti

Testuok su demo PIN: 1234
```

---

## 🎓 Mokymosi Kelias

### Level 1: Supratimas (1 diena)
1. Perskaityk **CURSOR_PROMPT_SHORT.md**
2. Suprask pagrindinį tikslą
3. Peržiūrėk stack'ą
4. Pažiūrėk demo duomenis

### Level 2: Setup (1 diena)
1. Perskaityk **CURSOR_AI_PROMPT.md** sekciją "Backend Foundation"
2. Setup Express + SQLite
3. Sukurk database schema
4. Paleisk seed skriptą
5. Testuok API

### Level 3: Core Features (2-3 dienos)
1. Perskaityk **CURSOR_AI_PROMPT.md** "ULTRA GREITAS ĮVEDIMAS"
2. Sukurk frontend komponentus
3. Integruok su backend
4. Testuok workflow
5. Optimizuok greitį

### Level 4: Full System (1-2 dienos)
1. Pridėk PIN sistemą
2. Implementuok transakcijas
3. Stock valdymas
4. UI polish
5. Testavimas

### Level 5: Production (1 diena)
1. Perskaityk "DEPLOYMENT INSTRUKCIJOS"
2. Build production
3. Deploy backend (VPS)
4. Deploy frontend (Netlify/Vercel)
5. SSL + Domain

---

## ✅ Checklist

**Prieš Pradedant:**
- [ ] Perskaityta CURSOR_PROMPT_SHORT.md (bent kartą)
- [ ] Suprastas pagrindinis tikslas (ULTRA greitas įvedimas)
- [ ] Node.js 18+ įdiegtas
- [ ] Code editor ready (VSCode su Cursor)

**Backend:**
- [ ] Express serveris veikia
- [ ] SQLite database sukurta
- [ ] Auth endpoints veikia (login, verify-pin)
- [ ] Products search endpoint veikia ⚡
- [ ] Transactions endpoint veikia
- [ ] Seed demo data sėkmingai

**Frontend:**
- [ ] React app kompiliuojasi
- [ ] TailwindCSS veikia
- [ ] Login puslapis veikia
- [ ] ProductSearchInput komponentas veikia ⚡
- [ ] QuantityInput komponentas veikia ⚡
- [ ] Automatinis fokuso valdymas veikia ⚡
- [ ] PIN patvirtinimas veikia

**Testing:**
- [ ] 10 prekių per <30 sekundžių
- [ ] Barkodų skanavimas veikia
- [ ] PIN patvirtinimas 100%
- [ ] Stock'ai atnaujinami teisingai
- [ ] Visi tekstai LT
- [ ] Mobile responsive

---

## 🆘 Problemos?

### "Nesuprantu nuo ko pradėti"
→ Pradėk nuo **CURSOR_PROMPT_SHORT.md**  
→ Skaitymo laikas: 5 minutės  
→ Po to: Backend setup

### "Per daug informacijos"
→ Nenaudok pilno prompt'o  
→ Naudok **CURSOR_PROMPT_SHORT.md**  
→ Arba skaityk tik reikalingas sekcijas

### "Kaip testuoti greito įvedimo workflow?"
→ Žiūrėk **CURSOR_AI_PROMPT.md** sekciją "TESTAVIMO SCENARIJAI"  
→ Test 1: Greitas Produkto Įvedimas

### "Backend veikia, bet frontend ne"
→ Patikrink VITE_API_URL env variable  
→ Turėtų būti: `http://localhost:5000/api`  
→ Patikrink CORS backend'e

### "PIN patvirtinimas neveikia"
→ Patikrink bcrypt compare  
→ Patikrink ar PIN hash'inamas kūrimo metu  
→ Demo PIN: 1234

---

## 🎯 Galutinis Patarimas

**Cursor AI yra galingas tik su geru prompt'u!**

- Būk **konkretus** (ne "padaryk viską")
- Nurodykit **sekcijas** (pvz. "žiūrėk PRODUKTŲ PAIEŠKA sekciją")
- Pateik **kontekstą** (kas veikia, kas ne)
- Aprašyk **tikėtiną rezultatą** (ką turi daryti)

---

**Sėkmės kuriant sistemą! 🚀**

Jei sistema pasiekia tikslą (10 prekių per 15-20 sekundžių), mes laimėjome! 🎯
