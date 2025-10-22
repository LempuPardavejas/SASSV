# 🚀 GREITAS CURSOR AI PROMPT - Inventoriaus Sistema

## TIKSLAS
Sukurk **inventoriaus valdymo sistemą** Lietuvos įmonei, kuri skolina prekes kitoms įmonėms. Sistema turi pakeisti rankinį užrašymą į sąsiuvinius.

## AUKŠČIAUSIAS PRIORITETAS: ⚡ ULTRA GREITAS ĮVEDIMAS

**Workflow:**
```
1. Įvedi produkto kodą/barkodą → ENTER
2. Auto-fokusas → kiekio laukas
3. Įvedi kiekį → ENTER  
4. Produktas pridėtas!
5. Auto-fokusas → produkto paieška
6. KARTOJI BE PELĖS! 🚀

Tikslas: 10 prekių per 15 sekundžių!
```

## TECHNINĖ SPECIFIKACIJA

### Stack
- **Backend:** Node.js + Express + SQLite + JWT + bcrypt
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Lucide React
- **Portai:** Backend 5000, Frontend 5173

### Duomenų Struktūra
```typescript
Users (username, password_hash, role: ADMIN|CLIENT, company_id, pin_hash)
Companies (code, name, email, phone, credit_limit)
Products (code, barcode, name, category, unit, stock, price, min_stock)
Projects (company_id, name, status: AKTYVUS|UZBAIGTAS)
Transactions (project_id, type: PAEMIMAS|GRAZINIMAS, items[], created_by, confirmed_by_pin)
TransactionItems (product_id, quantity, price_per_unit, total_price)
```

### Kritiniai Komponentai
1. **ProductSearchInput** - ieško pagal kodą/barkodą/pavadinimą, arrow navigation, ENTER select
2. **QuantityInput** - auto-focus, ENTER submit
3. **FastProductEntry** - pilnas workflow su auto-focus management
4. **PinModal** - 4 digit PIN patvirtinimas

## FUNKCIONALUMAS

### Vartotojų Tipai
**ADMIN:** 
- Username: `admin` / Password: `admin123` / PIN: `0000`
- Galimybės: viskas (produktai, įmonės, ataskaitos)

**CLIENT:**
- Username: `specvatas_user` / Password: `spec123` / PIN: `1234`
- Galimybės: tik PAIMTI/GRĄŽINTI prekes savo įmonei

### Pagrindinis Workflow (Klientas)
1. Prisijungia
2. Pasirenka "PAIMTI PREKES" arba "GRĄŽINTI PREKES"
3. Pasirenka projektą
4. **GREITAS ĮVEDIMAS:**
   - Įveda produktą (kodas/barkodas/pavadinimas) → ENTER
   - Sistema randa produktą, fokusas → kiekis
   - Įveda kiekį → ENTER
   - Produktas krepšelyje, fokusas → produkto paieška
   - **KARTOJA!**
5. Peržiūri krepšelį (gali edit/delete)
6. "Patvirtinti su PIN"
7. Įveda 4 skaitmenis
8. Sistema:
   - Tikrina PIN
   - Kuria transakciją
   - Atnaujina stock (paėmimas: -, grąžinimas: +)
   - Rodo sėkmę
   - Išvalo krepšelį

## API ENDPOINTS (Svarbiausieji)

```javascript
// Auth
POST   /api/auth/login
POST   /api/auth/verify-pin

// Products (KRITINIS!)
GET    /api/products/search?q=:query  // Ieško pagal code/barcode/name
GET    /api/products

// Transactions
POST   /api/transactions              // Reikia PIN!
GET    /api/transactions

// Projects
GET    /api/projects
GET    /api/projects/company/:id

// Seed
POST   /api/seed                      // Demo duomenys
```

## PRODUKTŲ PAIEŠKA (⚡ KRITINIS ENDPOINT!)

```sql
SELECT * FROM products
WHERE 
  code LIKE '%' || :query || '%'
  OR barcode LIKE '%' || :query || '%'
  OR name LIKE '%' || :query || '%'
ORDER BY 
  CASE 
    WHEN code = :query THEN 1
    WHEN barcode = :query THEN 2
    ELSE 3
  END
LIMIT 10;
```

## BARKODŲ SKANERIAI
- Skaneriai = klaviatūra (įveda tekstą + ENTER)
- JOKIŲ papildomų bibliotekų!
- Sistema atpažįsta automatiškai

## PIN PATVIRTINIMAS
- **KIEKVIENA** transakcija reikalauja PIN
- 4 skaitmenų
- bcrypt hash
- "Parašas" sąskaitoje

## STOCK VALDYMAS
```javascript
// PAEMIMAS
items.forEach(item => product.stock -= item.quantity);

// GRAZINIMAS
items.forEach(item => product.stock += item.quantity);
```

## DEMO DUOMENYS

### Produktai
```
0010006 | Kabelis YDYP 3x1.5 | Barkodas: 1524544204585 | Stock: 500m
0010007 | Kabelis YDYP 3x2.5 | Barkodas: 1524544204586 | Stock: 350m
0020001 | Jungiklis Schneider Electric | Stock: 80vnt
0030015 | LED lempa 10W | Stock: 120vnt
0040022 | Kabelių kanalas 25x16 | Stock: 200m
```

### Įmonės
```
SPECVATAS - UAB "Spec Vatas"
ELEKTRA - UAB "Elektra LT"
STATYBOS - UAB "Statybų Kompanija"
```

## UI/UX REIKALAVIMAI

### Dizainas
- **Minimalistinis** - tik reikalingi elementai
- **Didelės sąveikos zonos** - min 44×44px
- **Lietuvių kalba** - VISI tekstai!
- **Responsive** - mobile-first
- **TailwindCSS spalvos:** blue-500 (primary), green-500 (success), red-500 (danger)

### Fokuso Valdymas (KRITINIS!)
```tsx
// Po produkto pasirinkimo
quantityInputRef.current?.focus();

// Po kiekio submit
productSearchInputRef.current?.focus();
productSearchInputRef.current?.select();

// Auto-focus props
<ProductSearchInput autoFocus={true} />
<QuantityInput autoFocus={true} />
```

## ĮGYVENDINIMO EILIŠKUMAS

1. ✅ **Backend:** Express + SQLite + Auth + PIN
2. ✅ **API:** Products (search!), Transactions, Projects
3. ✅ **Frontend:** React setup + Router + AuthContext
4. ✅ **ULTRA GREITAS ĮVEDIMAS** (PRIORITETAS #1!)
   - ProductSearchInput (real-time search, arrow nav)
   - QuantityInput (auto-focus)
   - FastProductEntry (workflow)
   - ENTER handling
   - Auto-focus management
5. ✅ **Transakcijos:** PIN modal + creation + stock updates
6. ✅ **Pages:** Login, Dashboard, TakeProducts, ReturnProducts
7. ⏳ **Admin:** Dashboard, CRUD, Reports (optional)

## SĖKMĖS KRITERIJAI

✅ 10 prekių per 20 sekundžių (be pelės!)  
✅ Barkodų skaneriai veikia iškart  
✅ PIN 100% reliable  
✅ Stock'ai tikslūs  
✅ Visi tekstai LT  
✅ Veikia mobile + desktop  
✅ API < 200ms  

## SVARBIAUSIAS KLAUSIMAS

> "Ar tai padaro prekių įvedimą greitesnį?"

- Jei **TAIP** → Daryk
- Jei **NE** → Nedaryk

**Greitis > Funkcionalumas > Dizainas**

---

## PRADĖTI DARBĄ

```bash
# Backend
cd server && npm install && npm run dev

# Seed demo data
curl -X POST http://localhost:5000/api/seed

# Frontend
cd client && npm install && npm run dev

# Naršyklė
http://localhost:5173
Login: specvatas_user / spec123 / PIN: 1234
```

---

**Sistema turi pakeisti sąsiuvinį!** 🎯

Jei vartotojas sako *"Niekada nebegrįšiu prie sąsiuvinio"* - mes laimėjome! 🚀
