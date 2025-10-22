# Inventoriaus Valdymo Sistema

Profesionali inventoriaus valdymo sistema (WMS/POS) Lietuvos įmonėms. Sistema skirta greitam prekių ėmimo ir grąžinimo registravimui su barkodų palaikymu ir PIN kodų patvirtinimu.

## 🎯 Pagrindinės Savybės

- ⚡ **ULTRA GREITAS** prekių įvedimas - pagrindinis prioritetas!
- 🔍 Vienas paieškos laukelis (kodas/barkodas/pavadinimas)
- ⌨️ ENTER klavišo navigacija be pelės
- 🎯 Automatinis fokuso valdymas
- 🔐 PIN kodų patvirtinimas kiekvienai transakcijai
- 📊 Realus produktų likučių valdymas
- 📁 Projektų/sąrašų sistema
- 👥 Du vartotojų tipai (Admin/Klientas)
- 🇱🇹 Lietuviška sąsaja
- 📱 Responsive dizainas

## 🛠️ Technologijos

### Backend
- Node.js + Express
- SQLite (lengvam diegimui)
- JWT autentifikacija
- bcryptjs slaptažodžių šifravimui

### Frontend
- React 18 + TypeScript
- Vite (greitas development)
- TailwindCSS (stilizavimas)
- Lucide React (ikonėlės)
- Axios (HTTP klientas)
- React Router (navigacija)

## 📋 Reikalavimai

- Node.js 18+ (rekomenduojama 20+)
- npm arba yarn

## 🚀 Greitas Startas

### 1. Klonuokite repozitoriją

```bash
git clone <repository-url>
cd workspace
```

### 2. Backend Setup

```bash
# Eiti į server katalogą
cd server

# Įdiegti dependencies
npm install

# Paleisti serverį (development mode)
npm run dev
```

Serveris pasileis ant `http://localhost:5000`

### 3. Užpildyti Duomenų Bazę Demo Duomenimis

Kol serveris veikia, naujame terminale:

```bash
curl -X POST http://localhost:5000/api/seed
```

Arba naudojant naršyklę, eikite į: `http://localhost:5000/api/seed` ir atnaujinkite puslapį.

### 4. Frontend Setup

Naujame terminale:

```bash
# Eiti į client katalogą
cd client

# Įdiegti dependencies
npm install

# Paleisti development serverį
npm run dev
```

Frontend pasileis ant `http://localhost:5173`

### 5. Prisijungti prie Sistemos

Atidarykite naršyklę ir eikite į: `http://localhost:5173`

## 🔐 Demo Prisijungimai

### Administratorius
- **Vartotojas:** `admin`
- **Slaptažodis:** `admin123`
- **PIN:** `0000`

### Klientai

#### UAB "Spec Vatas"
- **Vartotojas:** `specvatas_user`
- **Slaptažodis:** `spec123`
- **PIN:** `1234`

#### UAB "Elektra LT"
- **Vartotojas:** `elektra_user`
- **Slaptažodis:** `elektra123`
- **PIN:** `2345`

#### UAB "Statybų Kompanija"
- **Vartotojas:** `statybos_user`
- **Slaptažodis:** `statybos123`
- **PIN:** `3456`

## 📦 Demo Produktai

Sistema sukuriama su šiais produktais:

- **0010006** - Kabelis YDYP 3x1.5 (Barkodas: 1524544204585)
- **0010007** - Kabelis YDYP 3x2.5 (Barkodas: 1524544204586)
- **0020001** - Jungiklis Schneider Electric
- **0030015** - LED lempa 10W
- **0040022** - Kabelių kanalas 25x16
- ir kt.

## 🎮 Kaip Naudotis

### Kliento Workflow (PAĖMIMAS)

1. **Prisijungti** su kliento kredencialais
2. **Spausti "PAIMTI PREKES"**
3. **Pasirinkti projektą** iš sąrašo
4. **Greitai įvesti prekes:**
   - Įvesti kodą/barkodą/pavadinimą paieškos lauke
   - Spausti ENTER
   - Įvesti kiekį
   - Spausti ENTER
   - Kartoti!
5. **Peržiūrėti krepšelį** (galima redaguoti/šalinti)
6. **Spausti "Patvirtinti su PIN"**
7. **Įvesti PIN kodą** (4 skaitmenys)
8. **Transakcija išsaugoma** automatiškai

### Kliento Workflow (GRĄŽINIMAS)

Analogiškas procesui "PAĖMIMAS", tik pasirenkama "GRĄŽINTI PREKES".

### Barkodų Skanavimas

1. Prijunkite USB/Bluetooth barkodų skanerį
2. Skanavimas veikia automatiškai - skaneris įveda barkodą ir paspaudžia ENTER
3. Sistema automatiškai atpažįsta produktą
4. Įveskite kiekį ir spauskite ENTER

## 📁 Projekto Struktūra

```
workspace/
├── server/                 # Backend
│   ├── config/            # Konfigūracija (database)
│   ├── models/            # Duomenų modeliai
│   ├── routes/            # API route'ai
│   ├── middleware/        # Auth, validation
│   ├── utils/             # Helper funkcijos
│   ├── server.js          # Express serveris
│   └── package.json
│
├── client/                # Frontend
│   ├── src/
│   │   ├── components/   # React komponentai
│   │   ├── pages/        # Puslapiai
│   │   ├── context/      # Context API (Auth)
│   │   ├── utils/        # API klientas
│   │   ├── types/        # TypeScript tipai
│   │   ├── App.tsx       # Pagrindinis komponentas
│   │   └── main.tsx      # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── README.md              # Šis failas
```

## 🔑 Pagrindiniai Komponentai

### Backend API Endpoints

- `POST /api/auth/login` - Prisijungimas
- `POST /api/auth/verify-pin` - PIN patvirtinimas
- `GET /api/products` - Produktų sąrašas
- `GET /api/products/search?q=query` - Produktų paieška
- `POST /api/transactions` - Transakcijos kūrimas
- `GET /api/transactions` - Transakcijų sąrašas
- `GET /api/projects` - Projektų sąrašas
- `GET /api/companies` - Įmonių sąrašas

### Frontend Komponentai

- **ProductSearchInput** - ULTRA greitas paieškos laukelis
- **QuantityInput** - Kiekio įvedimas su auto-focus
- **FastProductEntry** - Pilnas greito įvedimo komponentas
- **PinModal** - PIN kodo patvirtinimo modalas
- **Button, Input, Modal** - Baziniai UI komponentai

## 🧪 Testavimo Scenarijai

### Test Case 1: Greitas Produkto Įvedimas

1. Prisijunk kaip klientas (`specvatas_user` / `spec123`)
2. Spausk "PAIMTI"
3. Įvesk kodą: `0010006`
4. Spausk ENTER
5. ✓ Fokusas turėtų būti kiekio lauke
6. Įvesk kiekį: `15`
7. Spausk ENTER
8. ✓ Produktas turėtų būti krepšelyje
9. ✓ Fokusas turėtų grįžti į prekės laukelį

### Test Case 2: Barkodo Skanavimas

1. Nuskaityti barkodą: `1524544204585`
2. ✓ Sistema turėtų atpažinti "Kabelis YDYP 3x1.5"
3. ✓ Automatiškai pereiti į kiekio įvedimą

### Test Case 3: PIN Patvirtinimas

1. Pridėti prekių į krepšelį
2. Spausti "PATVIRTINTI SU PIN"
3. Įvesti PIN: `1234`
4. ✓ Transakcija turėtų būti išsaugota
5. ✓ Likučiai turėtų atsinaujinti

## 🐛 Troubleshooting

### Backend nepasileido

```bash
# Patikrinti ar įdiegti dependencies
cd server
npm install

# Patikrinti ar yra .env failas
ls -la

# Paleisti su debug
npm run dev
```

### Frontend nepasileido

```bash
# Patikrinti ar įdiegti dependencies
cd client
npm install

# Išvalyti cache ir rebuildin
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Duomenų bazė tuščia

```bash
# Užpildyti demo duomenimis
curl -X POST http://localhost:5000/api/seed
```

### Nepavyksta prisijungti

- Patikrinti ar backend veikia (http://localhost:5000/api/health)
- Patikrinti ar duomenų bazė užpildyta
- Naudoti demo kredencialus (žr. aukščiau)

## 🚀 Production Deployment

### Backend

```bash
cd server

# Build nereikia (Node.js runtime)
# Nustatyti environment variables
export NODE_ENV=production
export JWT_SECRET=your-secure-secret-key
export PORT=5000

# Paleisti su PM2
npm install -g pm2
pm2 start server.js --name inventory-api
pm2 save
pm2 startup
```

### Frontend

```bash
cd client

# Build production
npm run build

# Deploy į Netlify/Vercel/nginx
# dist/ katalogas turi static failus
```

## 🔧 Environment Variables

### Server (.env)

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
DATABASE_PATH=./database.sqlite
```

### Client

Sukurti `.env` faile:

```env
VITE_API_URL=http://localhost:5000/api
```

Production:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## 📝 Licencija

MIT License

## 👨‍💻 Autorius

Sukurta naudojant Cursor AI

## 🆘 Pagalba

Jei kyla klausimų arba problemų:

1. Patikrinti šį README
2. Patikrinti Troubleshooting sekciją
3. Patikrinti server/client logus konsolėje
4. Sukurti issue GitHub repozitorijoje

---

**Sėkmingo naudojimo! 🚀**
