# 🤖 CURSOR AI - INVENTORIAUS VALDYMO SISTEMA - PILNAS PROMPT

## 📋 PROJEKTO KONTEKSTAS

Sukurk profesionalią **Inventoriaus Valdymo Sistemą (WMS/POS)** Lietuvos įmonei, kuri teikia prekes į skolą kelioms įmonėms. 

### Verslo Problema
Įmonės šiuo metu rašo prekių paėmimus rankiniu būdu į sąsiuvinius. Kiekviena diena vyksta daug prekių paėmimų ir grąžinimų. Mėnesio gale reikia pateikti kiekvienai įmonei detalią sąskaitą su:
- Data ir laiku
- Kas ėmė (parašas/PIN)
- Kokias prekes
- Kokius kiekius
- Bendra suma

### Pagrindinis Tikslas
**PAKEISTI SĄSIUVINĮ** greita, tiksliai ir patogia skaitmenine sistema su **ULTRA GREITU** prekių įvedimu.

---

## 🎯 KRITINIAI PRIORITETAI

### 1. ULTRA GREITAS ĮVEDIMAS (AUKŠČIAUSIAS PRIORITETAS!)
```
Workflow privalo būti toks:
┌────────────────────────────────────────┐
│ 1. Įvedi produkto kodą/barkodą        │
│    👉 ENTER                            │
├────────────────────────────────────────┤
│ 2. Automatinis fokusas → kiekio laukas│
│    Įvedi kiekį (pvz. 25)              │
│    👉 ENTER                            │
├────────────────────────────────────────┤
│ 3. Produktas pridėtas!                │
│    Automatinis fokusas → produkto      │
│    paieška                             │
└────────────────────────────────────────┘
   KARTOJI BE PELES! ⚡
```

**Reikalavimai:**
- ❗ **VIENAS** paieškos laukelis ieško pagal VISKĄ (kodą, barkodą, pavadinimą)
- ❗ **ENTER** klavišas valdo visą workflow - pelės nereikia!
- ❗ **Automatinis fokuso valdymas** - sistema pati žino kur reikia fokuso
- ❗ **Real-time paieška** - rezultatai iškart vos pradedi rašyti
- ❗ **Arrow klavišai** - navigacija dropdown rezultatuose
- ❗ **Tab naudojimas** - greitas perėjimas tarp laukų jei reikia

### 2. BARKODŲ SKENERIŲ PALAIKYMAS
- USB/Bluetooth skeneriai emituoja **klaviatūros įvestį**
- Skaneris įveda barkodą ir automatiškai paspaudžia ENTER
- Sistema turi **atpažinti barkodą** ir rodyti produktą
- **JOKIŲ PAPILDOMŲ INTEGRALACIJŲ** - tai tiesiog tekstas!

### 3. PIN PATVIRTINIMAS
- **KIEKVIENA** transakcija turi būti patvirtinta 4 skaitmenų PIN kodu
- PIN kodas identifikuoja kas ėmė prekes
- Šifruotas bcrypt
- Klaidingo PIN atveju - klaidos pranešimas

### 4. REALUS LIKUČIŲ VALDYMAS
- Paėmimas → mažina stock
- Grąžinimas → didina stock
- Rodyti esamus likučius paieškos metu
- Perspėjimas jei likutis žemas

---

## 🛠️ TECHNINĖ SPECIFIKACIJA

### Stack
```yaml
Backend:
  - Node.js + Express
  - SQLite (development) arba PostgreSQL (production)
  - JWT autentifikacija
  - bcryptjs PIN/password šifravimui
  - Port: 5000

Frontend:
  - React 18 + TypeScript
  - Vite (fast build tool)
  - TailwindCSS (styling)
  - Lucide React (icons)
  - Axios (HTTP client)
  - React Router (navigation)
  - Port: 5173

Database:
  - SQLite (lengvas setup)
  - PostgreSQL (production)
```

### Projekto Struktūra
```
/workspace
├── client/               # FRONTEND
│   ├── src/
│   │   ├── components/   # UI komponentai
│   │   │   ├── ProductSearchInput.tsx    # ⚡ KRITINIS!
│   │   │   ├── QuantityInput.tsx         # ⚡ KRITINIS!
│   │   │   ├── FastProductEntry.tsx      # ⚡ KRITINIS!
│   │   │   ├── PinModal.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── TakeProducts.tsx          # PAIMTI
│   │   │   ├── ReturnProducts.tsx        # GRĄŽINTI
│   │   │   └── AdminDashboard.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/              # BACKEND
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Product.js
│   │   ├── Project.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── transactions.js
│   │   ├── projects.js
│   │   └── companies.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
│
├── README.md
├── PROJECT_STATUS.md
├── QUICK_START.md
└── start.sh
```

---

## 📊 DUOMENŲ STRUKTŪRA

### 1. Users (Vartotojai)
```typescript
interface User {
  id: string;
  username: string;           // Unikalus
  passwordHash: string;       // bcrypt
  role: 'ADMIN' | 'CLIENT';
  companyId?: string;         // NULL jei ADMIN
  pinHash: string;            // bcrypt, 4 skaitmenys
  createdAt: Date;
}
```

**Demo vartotojai:**
```javascript
// Administratorius
{ username: 'admin', password: 'admin123', pin: '0000', role: 'ADMIN' }

// Klientai
{ username: 'specvatas_user', password: 'spec123', pin: '1234', company: 'SPECVATAS' }
{ username: 'elektra_user', password: 'elektra123', pin: '2345', company: 'ELEKTRA' }
{ username: 'statybos_user', password: 'statybos123', pin: '3456', company: 'STATYBOS' }
```

---

### 2. Companies (Įmonės)
```typescript
interface Company {
  id: string;
  code: string;              // Unikalus kodas (SPECVATAS)
  name: string;              // UAB "Spec Vatas"
  email: string;
  phone: string;
  address?: string;
  creditLimit?: number;      // Kredito limitas €
  createdAt: Date;
}
```

**Demo įmonės:**
```javascript
{ code: 'SPECVATAS', name: 'UAB "Spec Vatas"', email: 'info@specvatas.lt' }
{ code: 'ELEKTRA', name: 'UAB "Elektra LT"', email: 'info@elektralt.lt' }
{ code: 'STATYBOS', name: 'UAB "Statybų Kompanija"', email: 'info@statybos.lt' }
```

---

### 3. Products (Produktai)
```typescript
interface Product {
  id: string;
  code: string;              // Lokalus kodas (0010006) - UNIKALUS
  barcode?: string;          // EAN/UPC barkodas (1524544204585) - UNIKALUS
  name: string;              // Kabelis YDYP 3x1.5
  category: string;          // Kabeliai, Jungikliai, Lempų, Kanalai...
  unit: 'vnt' | 'm' | 'kg' | 'l';  // Matavimo vienetas
  stock: number;             // Likutis sandėlyje
  price: number;             // Kaina už vienetą €
  minStock?: number;         // Minimalus likutis (alert)
  createdAt: Date;
}
```

**Demo produktai:**
```javascript
{
  code: '0010006',
  barcode: '1524544204585',
  name: 'Kabelis YDYP 3x1.5',
  category: 'Kabeliai',
  unit: 'm',
  stock: 500,
  price: 1.25,
  minStock: 100
},
{
  code: '0010007',
  barcode: '1524544204586',
  name: 'Kabelis YDYP 3x2.5',
  category: 'Kabeliai',
  unit: 'm',
  stock: 350,
  price: 1.85,
  minStock: 100
},
{
  code: '0020001',
  name: 'Jungiklis Schneider Electric',
  category: 'Jungikliai',
  unit: 'vnt',
  stock: 80,
  price: 8.50,
  minStock: 20
},
{
  code: '0030015',
  name: 'LED lempa 10W',
  category: 'Lempos',
  unit: 'vnt',
  stock: 120,
  price: 5.90,
  minStock: 30
},
{
  code: '0040022',
  name: 'Kabelių kanalas 25x16',
  category: 'Kanalai',
  unit: 'm',
  stock: 200,
  price: 2.40,
  minStock: 50
}
// ... ir daugiau
```

---

### 4. Projects (Projektai/Sąrašai)
```typescript
interface Project {
  id: string;
  companyId: string;         // Įmonės ID
  name: string;              // "2025 Sausio užsakymas"
  status: 'AKTYVUS' | 'UZBAIGTAS';
  createdAt: Date;
  updatedAt: Date;
}

// Skaičiuojamoji statistika (ne DB laukai)
interface ProjectStats {
  totalTransactions: number;  // Transakcijų skaičius
  totalItems: number;         // Prekių vienetų
  totalValue: number;         // Bendra vertė €
}
```

**Demo projektai:**
```javascript
{
  company: 'SPECVATAS',
  name: '2025 Spalio užsakymas',
  status: 'AKTYVUS'
}
```

---

### 5. Transactions (Transakcijos)
```typescript
interface Transaction {
  id: string;
  projectId: string;         // Projektas kuriam priklauso
  companyId: string;         // Įmonė
  type: 'PAEMIMAS' | 'GRAZINIMAS';
  items: TransactionItem[];  // Prekių sąrašas
  createdBy: string;         // User ID
  confirmedByPin: boolean;   // Ar patvirtinta PIN
  notes?: string;            // Pastabos
  createdAt: Date;           // Data ir laikas
}

interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productCode: string;       // Snapshot
  productName: string;       // Snapshot
  quantity: number;          // Kiekis
  unit: string;              // Snapshot
  pricePerUnit: number;      // Snapshot
  totalPrice: number;        // quantity * pricePerUnit
}
```

**Transakcijos logika:**
```javascript
// PAEMIMAS
- items.forEach(item => {
    product.stock -= item.quantity;
  });
- Sukurti transaction įrašą su type='PAEMIMAS'
- PIN patvirtinimas

// GRAZINIMAS  
- items.forEach(item => {
    product.stock += item.quantity;
  });
- Sukurti transaction įrašą su type='GRAZINIMAS'
- PIN patvirtinimas
```

---

## 🔍 PRODUKTŲ PAIEŠKA (ULTRA SVARBU!)

### Paieškos Logika

**Vienas laukelis ieško pagal:**
1. **Lokalų kodą** (0010006)
2. **Barkodą** (1524544204585)
3. **Pavadinimą** (dalinį arba pilną)

**Backend endpoint:**
```javascript
// GET /api/products/search?q=:query

// SQL užklausa (SQLite)
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
  END,
  name ASC
LIMIT 10;
```

**Frontend komponentas:**
```tsx
// ProductSearchInput.tsx

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  autoFocus?: boolean;
}

// Funkcionalumas:
// 1. Real-time paieška kas 300ms (debounce)
// 2. Arrow Up/Down navigacija
// 3. ENTER pasirinkimui
// 4. Rodo: kodą, pavadinimą, vienetą, likutį, kainą
// 5. Dropdown su rezultatais
// 6. Loading state
// 7. No results state
```

**UI išvaizda:**
```
┌─────────────────────────────────────────┐
│ Ieškoti produkto (kodas/barkodas/pav.) │ 🔍
├─────────────────────────────────────────┤
│ ▶ 0010006 - Kabelis YDYP 3x1.5         │ ← pasirinktas
│   Likutis: 500 m | Kaina: 1.25 €/m     │
├─────────────────────────────────────────┤
│   0010007 - Kabelis YDYP 3x2.5         │
│   Likutis: 350 m | Kaina: 1.85 €/m     │
├─────────────────────────────────────────┤
│   1524544204585 (Barkodas)              │
│   Kabelis YDYP 3x1.5                    │
└─────────────────────────────────────────┘
```

---

## ⚡ GREITO ĮVEDIMO KOMPONENTAS

### FastProductEntry.tsx (KRITINIS!)

```tsx
interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

interface FastProductEntryProps {
  onComplete: (items: CartItem[]) => void;
  transactionType: 'PAEMIMAS' | 'GRAZINIMAS';
}

// Būsenos:
// 1. Produkto paieška (fokusas čia iš pradžių)
// 2. Kiekio įvedimas (fokusas čia po produkto pasirinkimo)
// 3. Krepšelis (galima redaguoti/šalinti)

// Workflow:
// ProductSearchInput → (pasirinkimas) → 
// QuantityInput → (ENTER) → 
// Pridėti į cart → 
// Grįžti į ProductSearchInput
```

**QuantityInput.tsx:**
```tsx
interface QuantityInputProps {
  unit: string;              // 'vnt', 'm', 'kg', 'l'
  onQuantitySubmit: (qty: number) => void;
  autoFocus: boolean;
}

// Features:
// - type="number"
// - step pagal vienetą (vnt=1, m=0.1, kg=0.01, l=0.01)
// - min="0"
// - ENTER paspaudimas → onQuantitySubmit()
// - Auto-focus kai atidaro
```

**Krepšelio (Cart) UI:**
```
┌──────────────────────────────────────────────────┐
│ PREKIŲ KREPŠELIS                                 │
├──────────────────────────────────────────────────┤
│ 1. Kabelis YDYP 3x1.5                           │
│    15 m × 1.25 €/m = 18.75 €     [Edit] [✕]    │
├──────────────────────────────────────────────────┤
│ 2. LED lempa 10W                                │
│    5 vnt × 5.90 €/vnt = 29.50 €  [Edit] [✕]    │
├──────────────────────────────────────────────────┤
│ 3. Jungiklis Schneider Electric                 │
│    2 vnt × 8.50 €/vnt = 17.00 €  [Edit] [✕]    │
├──────────────────────────────────────────────────┤
│                          VISO: 65.25 €          │
├──────────────────────────────────────────────────┤
│           [Patvirtinti su PIN]                   │
└──────────────────────────────────────────────────┘
```

---

## 🔐 PIN PATVIRTINIMO MODALAS

### PinModal.tsx

```tsx
interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  loading?: boolean;
}

// UI:
// - 4 input laukai (vienas skaitmuo kiekviename)
// - Automatinis fokuso perėjimas
// - Backspace grįžta atgal
// - Slėpti skaitmenus (type="password")
// - Klaviatūros navigacija
// - Submit kai visi 4 įvesti

// Dizainas:
┌─────────────────────────────┐
│   Įveskite PIN kodą         │
├─────────────────────────────┤
│                             │
│   [•]  [•]  [•]  [•]       │
│                             │
├─────────────────────────────┤
│  [Atšaukti]  [Patvirtinti] │
└─────────────────────────────┘
```

**Backend PIN tikrinimas:**
```javascript
// POST /api/auth/verify-pin
{
  userId: "user-id",
  pin: "1234"
}

// Response:
{
  success: true,
  message: "PIN patvirtintas"
}
```

---

## 🎨 UI/UX DIZAINO PRINCIPAI

### Spalvų Paletė (TailwindCSS)
```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#3B82F6',    // blue-500
    hover: '#2563EB',      // blue-600
    light: '#DBEAFE',      // blue-100
  },
  success: {
    DEFAULT: '#10B981',    // green-500
    hover: '#059669',      // green-600
    light: '#D1FAE5',      // green-100
  },
  danger: {
    DEFAULT: '#EF4444',    // red-500
    hover: '#DC2626',      // red-600
    light: '#FEE2E2',      // red-100
  },
  warning: {
    DEFAULT: '#F59E0B',    // amber-500
    hover: '#D97706',      // amber-600
    light: '#FEF3C7',      // amber-100
  },
  background: '#F9FAFB',   // gray-50
  surface: '#FFFFFF',      // white
  text: {
    primary: '#111827',    // gray-900
    secondary: '#6B7280',  // gray-500
  }
}
```

### Dizaino Taisyklės
1. **Minimalizmas** - tik reikalingi elementai
2. **Didelės sąveikos zonos** - mygtukai min 44×44px
3. **Aiški hierarchija** - svarbiausias turinys išsiskiria
4. **Lietuvių kalba** - VISI tekstai LT
5. **Responsive** - mobile-first approach
6. **Spacing** - 4px grid (4, 8, 12, 16, 24, 32, 48, 64)
7. **Typography** - Inter arba system font stack

### Komponentų Biblioteka

**Button.tsx:**
```tsx
// Variantai: primary, secondary, danger, ghost
// Dydžiai: sm, md, lg
// Su loading state
// Su icon palaikymu
```

**Input.tsx:**
```tsx
// Label + input + error message
// Focus states
// Disabled state
// Icon support (left/right)
```

**Modal.tsx:**
```tsx
// Overlay + content
// ESC klavišas uždaryti
// Click outside uždaryti
// Focus trap inside
```

**Toast.tsx:**
```tsx
// Success, Error, Warning, Info
// Auto-dismiss po 3-5s
// Stack multiple toasts
// Pozicija: top-right
```

---

## 🚀 KLIENTO WORKFLOW (PAĖMIMAS)

### TakeProducts.tsx Puslapis

```
┌──────────────────────────────────────────────────┐
│  ← Atgal          PAIMTI PREKES           [Logout] │
├──────────────────────────────────────────────────┤
│                                                   │
│  Projektas: [2025 Spalio užsakymas ▼]           │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Ieškoti produkto...                 [🔍] │ │ ← FOKUSAS ČIA!
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ KREPŠELIS (0 prekių)                      │ │
│  │                                            │ │
│  │ [Tuščias krepšelis]                       │ │
│  │                                            │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│         [Patvirtinti su PIN] (disabled)          │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Po produkto pridėjimo:**
```
┌──────────────────────────────────────────────────┐
│  ← Atgal          PAIMTI PREKES           [Logout] │
├──────────────────────────────────────────────────┤
│                                                   │
│  Projektas: [2025 Spalio užsakymas ▼]           │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Ieškoti produkto...                 [🔍] │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ KREPŠELIS (3 prekės) - 65.25 €           │ │
│  ├────────────────────────────────────────────┤ │
│  │ 1. Kabelis YDYP 3x1.5                     │ │
│  │    15 m × 1.25 €/m = 18.75 €              │ │
│  │    [Redaguoti] [Šalinti]                  │ │
│  ├────────────────────────────────────────────┤ │
│  │ 2. LED lempa 10W                          │ │
│  │    5 vnt × 5.90 €/vnt = 29.50 €          │ │
│  │    [Redaguoti] [Šalinti]                  │ │
│  ├────────────────────────────────────────────┤ │
│  │ 3. Jungiklis Schneider Electric           │ │
│  │    2 vnt × 8.50 €/vnt = 17.00 €          │ │
│  │    [Redaguoti] [Šalinti]                  │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│         [Patvirtinti su PIN]                     │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Workflow žingsniai:**
1. Klientas prisijungia
2. Paspaudžia "PAIMTI PREKES"
3. Pasirenka projektą (arba automatiškai aktyvus)
4. **GREITAS ĮVEDIMAS:**
   - Įveda `0010006` → ENTER
   - Sistema fokusą perkelia į kiekį
   - Įveda `15` → ENTER
   - Produktas pridedamas į krepšelį
   - Fokusas grįžta į paieškos laukelį
   - **KARTOJA!**
5. Peržiūri krepšelį (gali redaguoti)
6. Paspaudžia "Patvirtinti su PIN"
7. PIN modalas atsidaro
8. Įveda PIN `1234`
9. Sistema:
   - Tikrina PIN
   - Kuria transakcijų
   - Atnaujina stock'us
   - Rodo sėkmės pranešimą
   - Išvalo krepšelį
   - Grąžina į dashboard

---

## 🔄 GRĄŽINIMO WORKFLOW

### ReturnProducts.tsx Puslapis

**Identiškas "PAĖMIMAS", tik:**
- Antraštė: "GRĄŽINTI PREKES"
- Transaction type: 'GRAZINIMAS'
- Stock logic: `product.stock += item.quantity`
- Spalvų schema: žalia (success) vietoj mėlynos

---

## 🎛️ ADMINISTRATORIAUS FUNKCIJOS

### AdminDashboard.tsx

```
┌──────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                          [Logout]│
├──────────────────────────────────────────────────┤
│                                                   │
│  📊 STATISTIKA                                   │
│  ┌─────────────┬─────────────┬─────────────┐   │
│  │ Šiandien    │ Aktyvūs     │ Žemi        │   │
│  │ transakcijų │ projektai   │ likučiai    │   │
│  │    15       │     8       │     3       │   │
│  └─────────────┴─────────────┴─────────────┘   │
│                                                   │
│  🚀 GREITI VEIKSMAI                              │
│  [Pridėti Produktą] [Sukurti Projektą]          │
│  [Registruoti Paėmimą] [Peržiūrėti Sąrašus]     │
│                                                   │
│  📋 NAUJOS TRANSAKCIJOS                          │
│  ┌────────────────────────────────────────────┐ │
│  │ 10:35 - SPECVATAS - Paėmė 3 prekes (25€) │ │
│  │ 11:20 - ELEKTRA - Grąžino 2 prekes (15€) │ │
│  │ 12:05 - STATYBOS - Paėmė 1 prekę (8€)    │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  📦 TOP ĮMONĖS (ŠISANDIEN)                       │
│  1. SPECVATAS - 125 €                            │
│  2. ELEKTRA - 89 €                               │
│  3. STATYBOS - 45 €                              │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Produktų Valdymas (ProductManagement.tsx)

- CRUD operacijos (Create, Read, Update, Delete)
- Lentelė su visais produktais
- Paieška ir filtravimas
- Sortavimas
- Masinis importas (CSV) - optional
- Likučių koregavimas
- Kategorijų valdymas

### Įmonių Valdymas (CompanyManagement.tsx)

- CRUD operacijos
- Vartotojų priskyrimas įmonėms
- Kredito limitų valdymas
- Statistika per įmonę

### Ataskaitų Generavimas (Reports.tsx)

**Mėnesio sąskaita (PDF):**
```
┌─────────────────────────────────────────┐
│ SĄSKAITA #2025-10-001                   │
├─────────────────────────────────────────┤
│ Įmonė: UAB "Spec Vatas"                 │
│ Laikotarpis: 2025-10-01 - 2025-10-31   │
│                                          │
│ TRANSAKCIJOS:                            │
│                                          │
│ 2025-10-15 10:35 (Vartotojas: Jonas)   │
│ PAĖMIMAS:                                │
│ - Kabelis YDYP 3x1.5: 15m × 1.25€ = 18.75€ │
│ - LED lempa 10W: 5vnt × 5.90€ = 29.50€ │
│   Suma: 48.25€                          │
│   PIN: ✓ Patvirtinta                   │
│                                          │
│ 2025-10-16 14:20 (Vartotojas: Petras)  │
│ GRĄŽINIMAS:                              │
│ - Kabelis YDYP 3x1.5: 5m × 1.25€ = 6.25€  │
│   Suma: -6.25€                          │
│   PIN: ✓ Patvirtinta                   │
│                                          │
│ ...                                      │
│                                          │
│ BENDRA SUMA: 125.50 €                   │
└─────────────────────────────────────────┘
```

**Biblioteka:** `pdfkit` arba `jspdf`

---

## 🔒 SAUGUMO REIKALAVIMAI

### Autentifikacija
```javascript
// JWT tokens
{
  accessToken: {
    payload: { userId, role, companyId },
    expiresIn: '1d'
  },
  refreshToken: {
    expiresIn: '7d'
  }
}

// PIN tikrinimas
bcrypt.compare(inputPin, user.pinHash);
```

### Autorizacija (Middleware)
```javascript
// middleware/auth.js

// Tikrina JWT token
const authenticateToken = (req, res, next) => { ... }

// Tikrina role
const requireRole = (role) => (req, res, next) => { ... }

// Tikrina company access
const requireCompanyAccess = (req, res, next) => { ... }

// Naudojimas:
router.get('/transactions', 
  authenticateToken, 
  requireCompanyAccess,
  getTransactions
);
```

### Input Validacija
```javascript
// Visur naudoti sanitization
const sanitize = require('sanitize-html');

// SQL injection prevencija
// Naudoti prepared statements / parameterized queries

// XSS prevencija
// Sanitizuoti visus user input'us

// Rate limiting
const rateLimit = require('express-rate-limit');
```

---

## 📡 API ENDPOINTS

### Authentication
```javascript
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-pin
GET    /api/auth/me
```

### Products
```javascript
GET    /api/products              // Visi produktai
GET    /api/products/:id          // Vienas produktas
GET    /api/products/search?q=    // Paieška ⚡ KRITINIS!
POST   /api/products              // Sukurti (ADMIN only)
PUT    /api/products/:id          // Atnaujinti (ADMIN only)
DELETE /api/products/:id          // Ištrinti (ADMIN only)
PATCH  /api/products/:id/stock    // Stock koregavimas (ADMIN only)
```

### Transactions
```javascript
GET    /api/transactions          // Visos (ADMIN) arba tik įmonės (CLIENT)
GET    /api/transactions/:id      // Viena transakcija
POST   /api/transactions          // Sukurti (reikia PIN!)
PUT    /api/transactions/:id      // Redaguoti (ADMIN only)
DELETE /api/transactions/:id      // Ištrinti (ADMIN only)
GET    /api/transactions/company/:companyId  // Įmonės transakcijos
GET    /api/transactions/project/:projectId  // Projekto transakcijos
```

### Projects
```javascript
GET    /api/projects              // Visi projektai
GET    /api/projects/:id          // Vienas projektas
GET    /api/projects/company/:companyId  // Įmonės projektai
POST   /api/projects              // Sukurti (ADMIN only)
PUT    /api/projects/:id          // Atnaujinti (ADMIN only)
DELETE /api/projects/:id          // Ištrinti (ADMIN only)
PATCH  /api/projects/:id/status   // Keisti statusą
```

### Companies
```javascript
GET    /api/companies             // Visos įmonės (ADMIN only)
GET    /api/companies/:id         // Viena įmonė
POST   /api/companies             // Sukurti (ADMIN only)
PUT    /api/companies/:id         // Atnaujinti (ADMIN only)
DELETE /api/companies/:id         // Ištrinti (ADMIN only)
```

### Reports
```javascript
GET    /api/reports/monthly/:projectId   // PDF sąskaita
GET    /api/reports/inventory             // Inventorizacija
POST   /api/reports/export-excel          // Excel eksportas
GET    /api/reports/stats                 // Dashboard statistika
```

### Utility
```javascript
POST   /api/seed                  // Užpildyti demo duomenis
GET    /api/health                // Health check
```

---

## 🗄️ DUOMENŲ BAZĖS SCHEMA (SQLite)

```sql
-- Users lentelė
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CLIENT')),
  company_id TEXT,
  pin_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Companies lentelė
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  credit_limit REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products lentelė
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL CHECK(unit IN ('vnt', 'm', 'kg', 'l')),
  stock REAL DEFAULT 0,
  price REAL NOT NULL,
  min_stock REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects lentelė
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'AKTYVUS' CHECK(status IN ('AKTYVUS', 'UZBAIGTAS')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Transactions lentelė
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('PAEMIMAS', 'GRAZINIMAS')),
  created_by TEXT NOT NULL,
  confirmed_by_pin INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction Items lentelė
CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit REAL NOT NULL,
  total_price REAL NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes optimizacijai
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
```

---

## 🧪 TESTAVIMO SCENARIJAI

### Test 1: Greitas Produkto Įvedimas
```
1. Prisijunk: specvatas_user / spec123
2. Spausk "PAIMTI PREKES"
3. Įvesk: 0010006
4. Spausk: ENTER
5. ✓ Tikėtina: Fokusas kiekio lauke
6. Įvesk: 15
7. Spausk: ENTER
8. ✓ Tikėtina: Produktas krepšelyje
9. ✓ Tikėtina: Fokusas produkto paieškoje
10. ✓ Tikėtina: Laukeliai išvalyti
```

### Test 2: Barkodo Skanavimas
```
1. Nuskanuok barkodą: 1524544204585
2. ✓ Tikėtina: Sistema randa "Kabelis YDYP 3x1.5"
3. ✓ Tikėtina: Fokusas pereina į kiekį
4. Įvesk: 20
5. Spausk: ENTER
6. ✓ Tikėtina: Produktas pridėtas
```

### Test 3: PIN Patvirtinimas
```
1. Pridėk kelias prekes į krepšelį
2. Spausk "Patvirtinti su PIN"
3. Įvesk PIN: 1234
4. ✓ Tikėtina: Transakcija sukurta
5. ✓ Tikėtina: Stock'ai atnaujinti
6. ✓ Tikėtina: Sėkmės pranešimas
7. ✓ Tikėtina: Krepšelis išvalytas
```

### Test 4: Klaidingo PIN
```
1. Pridėk prekių
2. Spausk "Patvirtinti su PIN"
3. Įvesk klaidingą PIN: 9999
4. ✓ Tikėtina: Klaidos pranešimas
5. ✓ Tikėtina: Transakcija NESUKURTA
6. ✓ Tikėtina: Krepšelis IŠLIEKA
```

### Test 5: Stock Atnaujinimas (Paėmimas)
```
Pradinis stock: 500m
1. Paimi 15m
2. ✓ Tikėtina: Stock = 485m
3. Paimi dar 25m
4. ✓ Tikėtina: Stock = 460m
```

### Test 6: Stock Atnaujinimas (Grąžinimas)
```
Pradinis stock: 460m
1. Grąžini 10m
2. ✓ Tikėtina: Stock = 470m
3. Grąžini dar 5m
4. ✓ Tikėtina: Stock = 475m
```

---

## 📦 DEPLOYMENT INSTRUKCIJOS

### Development

**1. Klonuoti repozitoriją:**
```bash
git clone <repo-url>
cd workspace
```

**2. Backend setup:**
```bash
cd server
npm install
npm run dev
# Serveris: http://localhost:5000
```

**3. Užpildyti demo duomenis:**
```bash
curl -X POST http://localhost:5000/api/seed
```

**4. Frontend setup:**
```bash
cd client
npm install
npm run dev
# Frontend: http://localhost:5173
```

---

### Production

**Backend (VPS):**
```bash
# 1. Įdiegti Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Klonuoti projektą
git clone <repo-url>
cd workspace/server

# 3. Įdiegti dependencies
npm install --production

# 4. Sukurti .env
cat > .env << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_PATH=/var/lib/inventory/database.sqlite
EOF

# 5. Paleisti su PM2
npm install -g pm2
pm2 start server.js --name inventory-api
pm2 save
pm2 startup

# 6. Nginx reverse proxy
sudo nano /etc/nginx/sites-available/inventory-api
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend (Netlify/Vercel):**
```bash
cd client

# Build
npm run build

# Deploy į Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Arba Vercel
npm install -g vercel
vercel --prod
```

---

## 🎯 ĮGYVENDINIMO EILIŠKUMAS

### 1. Backend Foundation (Pirma!)
- [x] Express serveris su CORS
- [x] SQLite setup
- [x] Database schema
- [x] Seed skriptas demo duomenims
- [x] JWT autentifikacija
- [x] PIN patvirtinimas

### 2. Backend API (Antra)
- [x] Auth routes (login, verify-pin)
- [x] **Products routes (search endpoint!)** ⚡ KRITINIS
- [x] Transactions routes (create, list)
- [x] Projects routes (list, create)
- [x] Companies routes (list)

### 3. Frontend Foundation (Trečia)
- [x] React + TypeScript + Vite setup
- [x] TailwindCSS
- [x] React Router
- [x] AuthContext
- [x] API client (axios)
- [x] Protected routes

### 4. **ULTRA GREITAS ĮVEDIMAS (Ketvirta ir SVARBIAUSIA!)** ⚡
- [x] **ProductSearchInput komponentas** - paieška su debounce
- [x] **QuantityInput komponentas** - su auto-focus
- [x] **FastProductEntry komponentas** - pilnas workflow
- [x] **ENTER klavišo handling**
- [x] **Automatinis fokuso valdymas**
- [x] **Arrow klavišų navigacija**

### 5. PIN & Transakcijos (Penkta)
- [x] PinModal komponentas
- [x] Transaction creation
- [x] Stock update logic
- [x] Success/error toasts

### 6. UI Pages (Šešta)
- [x] Login puslapis
- [x] ClientDashboard
- [x] TakeProducts puslapis
- [x] ReturnProducts puslapis
- [ ] AdminDashboard (optional)

### 7. Admin Features (Septinta - Optional)
- [ ] ProductManagement CRUD
- [ ] CompanyManagement CRUD
- [ ] Statistics dashboard
- [ ] Reports generation (PDF)

### 8. Testing & Polish (Aštunta)
- [ ] Real barcode scanner testing
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Mobile responsiveness
- [ ] Accessibility

---

## ⚠️ KRITINIAI DALYKAI (BŪTINA ATMINTI!)

### 1. GREITIS YRA VISKAS
```
Vartotojas turi galėti:
1. Įvesti produktą → ENTER (0.5s)
2. Įvesti kiekį → ENTER (0.5s)
3. Kartoti (0.5s)

Viena prekė = 1.5 sekundės!
10 prekių = 15 sekundžių!

Sąsiuvinis: 10 prekių = 5 minutės
Sistema: 10 prekių = 15 sekundžių

300x GREIČIAU! 🚀
```

### 2. FOKUSO VALDYMAS
```javascript
// Po produkto pasirinkimo
quantityInputRef.current?.focus();

// Po kiekio submit
productSearchInputRef.current?.focus();
productSearchInputRef.current?.select(); // Išvalyti

// Auto-focus props
<ProductSearchInput autoFocus={true} />
<QuantityInput autoFocus={true} />
```

### 3. BARKODŲ SKANERIAI
```
Skaneriai = Klaviatūra!
Nėra jokių library!
Tiesiog įveda tekstą + ENTER.

Sistema turi ATPAŽINTI:
- Kodas: trumpas (6-7 simboliai)
- Barkodas: ilgas (13+ simbolių)
- Pavadinimas: turi raidžių
```

### 4. PIN KIEKVIENAI TRANSAKCIJAI
```
NIEKADA nepraleisti PIN!
Kiekvienas paėmimas/grąžinimas = PIN.
Tai "parašas" sąskaitoje.
```

### 5. LIETUVIŲ KALBA
```
Visi tekstai LT!
Visi klaidos pranešimai LT!
Data formatai: 2025-10-22
Skaičiai: 1 234,56 €
```

---

## 💡 BEST PRACTICES

### TypeScript
```typescript
// Visada naudoti interfaces
interface Product { ... }
interface Transaction { ... }

// Vengti 'any'
const data: Product[] = await api.get('/products');

// Naudoti utility types
type TransactionType = 'PAEMIMAS' | 'GRAZINIMAS';
```

### React
```tsx
// Functional components
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => { ... }

// Custom hooks
const useAuth = () => { ... }
const useProducts = () => { ... }

// Memorizacija jei reikia
const memoizedValue = useMemo(() => heavyComputation(), [deps]);
```

### Error Handling
```typescript
// Frontend
try {
  const response = await api.post('/transactions', data);
  toast.success('Transakcija sėkmingai sukurta!');
} catch (error) {
  toast.error(error.response?.data?.message || 'Įvyko klaida');
}

// Backend
try {
  // ... logic
} catch (error) {
  console.error('Transaction creation error:', error);
  res.status(500).json({ 
    message: 'Nepavyko sukurti transakcijos',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

### Validacija
```javascript
// Backend - visada validuoti
const validateTransaction = (data) => {
  if (!data.projectId) throw new Error('Project ID required');
  if (!data.items || data.items.length === 0) {
    throw new Error('At least one item required');
  }
  data.items.forEach(item => {
    if (item.quantity <= 0) throw new Error('Quantity must be positive');
  });
};
```

---

## 📚 PAPILDOMOS BIBLIOTEKOS (Optional)

```json
// Backend
{
  "pdfkit": "^0.14.0",           // PDF generavimas
  "nodemailer": "^6.9.0",         // Email siuntimas
  "express-rate-limit": "^7.0.0", // Rate limiting
  "helmet": "^7.0.0",             // Security headers
  "winston": "^3.11.0"            // Logging
}

// Frontend
{
  "react-hot-toast": "^2.4.1",    // Toast notifications
  "date-fns": "^2.30.0",          // Data formatting
  "recharts": "^2.10.0",          // Charts (dashboard)
  "react-pdf": "^7.5.0"           // PDF peržiūra
}
```

---

## 🎓 INSTRUKCIJOS CURSOR AI

### Kai kursi šį projektą:

**1. PRADĖK NUO BACKEND:**
- Sukurk Express serverį
- Setup SQLite database
- Sukurk visus modelius
- Implementuok autentifikaciją
- **Ypač svarbu:** Produktų paieškos endpoint'as!

**2. TESTUOK API:**
- Naudok Thunder Client / Postman
- Testuok visus endpoint'us
- Patikrink auth middleware
- Patikrink PIN verification

**3. SUKURK FRONTEND PAGRINDĄ:**
- React + TypeScript setup
- TailwindCSS
- Router
- AuthContext
- API client

**4. IMPLEMENTUOK ULTRA GREITĄ ĮVEDIMĄ (PRIORITETAS #1!):**
- ProductSearchInput su real-time search
- QuantityInput su auto-focus
- FastProductEntry su pilnu workflow
- ENTER klavišo handling
- Automatinis fokuso valdymas
- **TESTUOK DAUG KARTŲ!**

**5. PRIDĖK TRANSAKCIJAS:**
- PIN modal
- Transaction creation
- Stock updates
- Success/error handling

**6. UI PUSLAPIAI:**
- Login
- Dashboard
- TakeProducts
- ReturnProducts

**7. ADMIN (optional):**
- Admin dashboard
- CRUD sąsajos
- Reports

**8. POLISH:**
- Testavimas
- Bug fixes
- Performance
- Dokumentacija

---

### Svarbūs patarimai:

✅ **DO:**
- Klausk savęs: "Ar tai padarys įvedimą greitesnį?"
- Naudok TypeScript tipos
- Rašyk aiškius commit message'us
- Testuok kiekvieną funkciją
- Handle errors properly
- Optimizuok performance

❌ **DON'T:**
- Nenaudok jQuery ar kitas senas bibliotekos
- Nesukurk per daug abstraction layers
- Nedaryk UI per sudėtingo
- Nepraleisk validacijos
- Neignoruok errors
- Nesiųsk slaptažodžių plaintext

---

### Debugging tips:

```javascript
// Backend logging
console.log('[AUTH] User logged in:', userId);
console.log('[TRANSACTION] Creating transaction:', data);
console.log('[SEARCH] Products found:', products.length);

// Frontend logging
console.log('[FOCUS] Moving focus to quantity input');
console.log('[CART] Adding item:', item);
console.log('[PIN] Verifying PIN for user:', userId);

// Error logging
console.error('[ERROR] Transaction failed:', error);
```

---

## 🎯 SĖKMĖS KRITERIJAI

### Projektas laikomas sėkmingu kai:

1. ✅ Vartotojas gali įvesti 10 prekių per 20 sekundžių (be pelės!)
2. ✅ Barkodų skaneriai veikia be papildomų setup'ų
3. ✅ PIN patvirtinimas veikia 100% atvejų
4. ✅ Stock'ai atnaujinami tiksliai
5. ✅ Visi tekstai lietuvių kalba
6. ✅ Sistema veikia mobile ir desktop
7. ✅ Jokių kritinių bug'ų
8. ✅ API response < 200ms
9. ✅ Frontend load < 2s
10. ✅ Database backup sistema

---

## 📞 SUPPORT

Jei kyla klausimų kurdamas šį projektą:

1. Perskaityk šį dokumentą dar kartą
2. Patikrink PROJECT_STATUS.md
3. Patikrink QUICK_START.md
4. Patikrink console logs
5. Patikrink network tab (DevTools)
6. Testuok API su Thunder Client

---

## 🏁 FINALINIAI ŽODŽIAI

**Šis projektas yra apie GREITĮ.**

Kiekvienas sprendimas, kiekviena funkcija, kiekvienas UI elementas turi atsakyti į klausimą:

> "Ar tai padaro prekių įvedimą greitesnį?"

Jei TAIP → Daryk.
Jei NE → Nedaryk.

**Greitis > Funkcionalumas > Dizainas**

Sėkmės kuriant! 🚀

---

**Paskutinė eilutė:**
Sistema turi pakeisti sąsiuvinį. Jei vartotojas nori grįžti prie sąsiuvinio - mes pralaimėjome. Jei vartotojas sako "Niekada nebegrįšiu prie sąsiuvinio" - mes laimėjome. 🎯
