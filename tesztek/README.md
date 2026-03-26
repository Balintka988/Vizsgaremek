# Autószerviz – Cypress Tesztek

## Könyvtárszerkezet

```
cypress-tests/
├── cypress.config.ts          # Cypress konfiguráció + env változók
├── package.json
├── tsconfig.json
└── cypress/
    ├── support/
    │   └── e2e.ts             # Custom commands (loginViaApi, loginViaUI)
    └── e2e/
        ├── backend.cy.ts      # 20 backend API teszt
        └── frontend.cy.ts     # 20 frontend E2E teszt
```

---

## Előfeltételek

1. **Backend fut** – `http://localhost:3000`
2. **Frontend fut** – `http://localhost:5173`
3. **MySQL adatbázis él** és a backend csatlakozni tud hozzá
4. Léteznie kell egy **admin felhasználónak** az adatbázisban

---

## Telepítés

```bash
cd cypress-tests
npm install
```

---

## Környezeti változók beállítása (`cypress.config.ts`)

Az `env` szekciót módosítsd a saját adataidra:

```ts
env: {
  apiUrl:        "http://localhost:3000/api",
  adminEmail:    "admin@autoszerviz.hu",   // ← létező admin email
  adminPassword: "admin123",               // ← admin jelszó
  ...
}
```

---

## Tesztek futtatása

### Interaktív mód (ajánlott fejlesztés közben)
```bash
npm run cy:open
```

### Headless mód (CI/CD)
```bash
# Minden teszt
npm run cy:run

# Csak backend tesztek
npm run cy:run:backend

# Csak frontend tesztek
npm run cy:run:frontend
```

---

## Backend tesztek – 20 db (`backend.cy.ts`)

| # | Leírás |
|---|--------|
| 1 | `POST /auth/register` – sikeres regisztráció |
| 2 | `POST /auth/register` – duplikált email → 400 |
| 3 | `POST /auth/login` – helyes adat → token visszaad |
| 4 | `POST /auth/login` – rossz jelszó → 400 |
| 5 | `POST /auth/login` – nem létező email → 400 |
| 6 | `GET /health` – health check → 200 |
| 7 | `GET /services` – publikus lista visszaad |
| 8 | `POST /services` – admin létrehoz szolgáltatást |
| 9 | `POST /services` – token nélkül → 401/403 |
| 10 | `GET /users/profile` – saját profil visszaad |
| 11 | `PUT /users/profile` – profil frissítése sikerül |
| 12 | `GET /users/profile` – token nélkül → 401 |
| 13 | `POST /cars` – autó hozzáadása sikerül |
| 14 | `GET /cars` – saját autók listázása |
| 15 | `GET /cars` – token nélkül → 401 |
| 16 | `GET /bookings/availability` – elérhetőség lekérdezése |
| 17 | `GET /bookings/availability` – hibás dátum → 400 |
| 18 | `POST /bookings` – foglalás létrehozása |
| 19 | `GET /bookings` – saját foglalások listázása |
| 20 | `DELETE /bookings/:id` – foglalás törlése |

---

## Frontend tesztek – 20 db (`frontend.cy.ts`)

| # | Leírás |
|---|--------|
| 1 | Főoldal `/` betölt |
| 2 | `/services` oldal betölt |
| 3 | `/about` oldal betölt |
| 4 | `/contact` oldal betölt |
| 5 | `/privacy` oldal betölt |
| 6 | `/login` – form megjelenik |
| 7 | Login – rossz adatokkal hibaüzenet |
| 8 | `/register` – form megjelenik |
| 9 | Regisztráció sikeres → átirányít `/login`-ra |
| 10 | Regisztrációs oldal „Jelentkezzen be" link működik |
| 11 | `/dashboard` – betölt bejelentkezve |
| 12 | `/cars/new` – autó hozzáadás form betölt |
| 13 | `/bookings/new` – foglalás oldal betölt |
| 14 | `/admin` – admin dashboard betölt |
| 15 | `/admin/services` – admin szolgáltatás oldal betölt |
| 16 | Főoldal – navbar megjelenik |
| 17 | Főoldal – footer megjelenik |
| 18 | Navbar – bejelentkezés link működik |
| 19 | Admin UI login → átirányít `/admin`-ra |
| 20 | Login oldal „Vissza a főoldalra" gomb működik |
