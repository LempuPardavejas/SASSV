# 🚀 Greitas Pradžios Vadovas

## Metodas 1: Automatinis Paleidimas (Rekomenduojama)

```bash
./start.sh
```

Šis skriptas:
- ✅ Automatiškai įdiegs dependencies (jei reikia)
- ✅ Užpildys duomenų bazę demo duomenimis (jei tuščia)
- ✅ Paleis backend serverį (port 5000)
- ✅ Paleis frontend serverį (port 5173)

## Metodas 2: Rankinis Paleidimas

### Backend

```bash
cd server
npm install
node seed-db.js    # Tik pirmą kartą
npm run dev
```

### Frontend

Naujame terminale:

```bash
cd client
npm install
npm run dev
```

## 🔐 Demo Prisijungimai

Po paleidimo, eikite į: **http://localhost:5173**

### Klientas (UAB "Spec Vatas")
- **Username:** `specvatas_user`
- **Password:** `spec123`
- **PIN:** `1234`

### Administratorius
- **Username:** `admin`
- **Password:** `admin123`
- **PIN:** `0000`

## ⚡ Ultra Greitas Įvedimas

1. Spausk **"PAIMTI PREKES"**
2. Įvesk kodą: `0010006` arba barkodą: `1524544204585`
3. Spausk **ENTER**
4. Įvesk kiekį: `15`
5. Spausk **ENTER**
6. Prekė pridėta! Kartok procesą.
7. Pabaigai spausk **"Patvirtinti su PIN"**
8. Įvesk PIN: `1234`

## 🧪 Testavimui

**Demo produktai:**
- `0010006` - Kabelis YDYP 3x1.5
- `0010007` - Kabelis YDYP 3x2.5
- `0020001` - Jungiklis Schneider Electric
- `0030015` - LED lempa 10W
- `0040022` - Kabelių kanalas 25x16

**Demo barkodai:**
- `1524544204585` - Kabelis YDYP 3x1.5
- `1524544204586` - Kabelis YDYP 3x2.5

## ❓ Problemos?

Žiūrėk pilną **README.md** su troubleshooting sekcija.

---

**Sėkmingo naudojimo! 🎉**
