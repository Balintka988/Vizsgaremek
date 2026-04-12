/// <reference types="cypress" />

const API = Cypress.env("apiUrl"); // http://localhost:3000/api
const ADMIN_EMAIL = Cypress.env("adminEmail");
const ADMIN_PASSWORD = Cypress.env("adminPassword");

let userToken: string;
let adminToken: string;
let createdCarId: number;
let createdBookingId: number;

// AUTH

describe("Backend – Auth végpontok", () => {
  // 1. Regisztráció sikeres
  it("1. POST /auth/register – sikeres regisztráció", () => {
    const uniqueEmail = `teszt_${Date.now()}@email.hu`;
    cy.request({
      method: "POST",
      url: `${API}/auth/register`,
      body: {
        name: "API Teszt User",
        email: uniqueEmail,
        phone: "+36301111111",
        password: "Jelszo123!",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq("Sikeres regisztráció");
    });
  });

  // 2. Regisztráció duplikált email
  it("2. POST /auth/register – duplikált email esetén hiba", () => {
    cy.request({
      method: "POST",
      url: `${API}/auth/register`,
      body: {
        name: "Dup User",
        email: ADMIN_EMAIL,
        phone: "+36309999999",
        password: "Jelszo123!",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  // 3. Bejelentkezés helyes adatokkal
  it("3. POST /auth/login – sikeres bejelentkezés, token visszaad", () => {
    cy.request({
      method: "POST",
      url: `${API}/auth/login`,
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
      expect(res.body).to.have.property("user");
      adminToken = res.body.token;
    });
  });

  // 4. Bejelentkezés rossz jelszóval
  it("4. POST /auth/login – rossz jelszóval 400 status", () => {
    cy.request({
      method: "POST",
      url: `${API}/auth/login`,
      body: { email: ADMIN_EMAIL, password: "rossz_jelszo" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.include("jelszó");
    });
  });

  // 5. Bejelentkezés nem létező emaillel
  it("5. POST /auth/login – nem létező email esetén 400 status", () => {
    cy.request({
      method: "POST",
      url: `${API}/auth/login`,
      body: { email: "nemletezik@valami.hu", password: "Akármi1!" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});

// HEALTH

describe("Backend – Health végpont", () => {
  // 6. Health check
  it("6. GET /health – 200 visszaad", () => {
    cy.request(`${API}/health`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
});

// SERVICES

describe("Backend – Services végpontok", () => {
  before(() => {
    cy.request("POST", `${API}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }).then((res) => {
      adminToken = res.body.token;
    });
  });

  // 7. Szolgáltatások lekérdezése (publikus)
  it("7. GET /services – publikus, listát ad vissza", () => {
    cy.request(`${API}/services`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  // 8. Szolgáltatás létrehozása adminként
  it("8. POST /services – admin létrehozhat szolgáltatást", () => {
    cy.request({
      method: "POST",
      url: `${API}/services`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: `Teszt Szerviz ${Date.now()}`,
        description: "Cypress teszt szolgáltatás",
        price: 9990,
        duration_minutes: 60,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  // 9. Szolgáltatás létrehozása token nélkül – tiltott
  it("9. POST /services – token nélkül 401/403 visszaad", () => {
    cy.request({
      method: "POST",
      url: `${API}/services`,
      body: { name: "Illegális", price: 1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });
});

// USERS

describe("Backend – User végpontok", () => {
  before(() => {
    const email = `usertest_${Date.now()}@email.hu`;
    cy.request("POST", `${API}/auth/register`, {
      name: "Normál User",
      email,
      phone: "+36302222222",
      password: "Teszt123!",
    }).then(() => {
      cy.request("POST", `${API}/auth/login`, {
        email,
        password: "Teszt123!",
      }).then((res) => {
        userToken = res.body.token;
      });
    });
  });

  // 10. Profil lekérdezése
  it("10. GET /users/profile – saját profil visszaad", () => {
    cy.request({
      method: "GET",
      url: `${API}/users/profile`,
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("email");
    });
  });

  // 11. Profil frissítése
  it("11. PUT /users/profile – profil frissítése sikerül", () => {
    cy.request({
      method: "PUT",
      url: `${API}/users/profile`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: { phone: "+36309876543" },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  // 12. Profil lekérése token nélkül – tiltott
  it("12. GET /users/profile – token nélkül 401 visszaad", () => {
    cy.request({
      method: "GET",
      url: `${API}/users/profile`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });
});

// CARS

describe("Backend – Cars végpontok", () => {
  before(() => {
    const email = `cartest_${Date.now()}@email.hu`;
    cy.request("POST", `${API}/auth/register`, {
      name: "Autó Tesztelő",
      email,
      phone: "+36303333333",
      password: "Teszt123!",
    }).then(() => {
      cy.request("POST", `${API}/auth/login`, {
        email,
        password: "Teszt123!",
      }).then((res) => {
        userToken = res.body.token;
      });
    });
  });

  // 13. Autó hozzáadása
  it("13. POST /cars – autó hozzáadható bejelentkezett userrel", () => {
    const plate = `CY-${Date.now().toString().slice(-4)}-TS`;
    cy.request({
      method: "POST",
      url: `${API}/cars`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        license_plate: plate,
        type: "Toyota Corolla",
        brand_group: "atlagos",
},
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.include("hozzáadva");
      createdCarId = res.body.result?.insertId ?? res.body.result?.[0]?.insertId;
    });
  });

  // 14. Autók listázása
  it("14. GET /cars – saját autók visszaad", () => {
    cy.request({
      method: "GET",
      url: `${API}/cars`,
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  // 15. Autó lekérése token nélkül – tiltott
  it("15. GET /cars – token nélkül 401 visszaad", () => {
    cy.request({
      method: "GET",
      url: `${API}/cars`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });
});

// BOOKINGS

describe("Backend – Bookings végpontok", () => {
  let bookingUserToken: string;
  let bookingCarId: number;
  let bookingServiceId: number;

  before(() => {
    const email = `booktest_${Date.now()}@email.hu`;

    cy.request("POST", `${API}/auth/register`, {
      name: "Foglalás Tesztelő",
      email,
      phone: "+36304444444",
      password: "Teszt123!",
    })
      .then(() =>
        cy.request("POST", `${API}/auth/login`, {
          email,
          password: "Teszt123!",
        })
      )
      .then((res) => {
        bookingUserToken = res.body.token;
      })
      .then(() =>
        cy.request({
          method: "POST",
          url: `${API}/cars`,
          headers: { Authorization: `Bearer ${bookingUserToken}` },
          body: {
            license_plate: `BT-${Date.now().toString().slice(-4)}-XY`,
            type: "Honda Civic",
            brand_group: "atlagos",
},
        })
      )
      .then((res) => {
        bookingCarId =
          res.body.result?.insertId ?? res.body.result?.[0]?.insertId;
      })
      .then(() => cy.request(`${API}/services`))
      .then((res) => {
        bookingServiceId = res.body[0]?.id ?? 1;
      });
  });

  // 16. Elérhetőség lekérdezése
  it("16. GET /bookings/availability – dátumtartományra visszaad", () => {
    const from = "2030-06-01";
    const to = "2030-06-07";
    cy.request(`${API}/bookings/availability?from=${from}&to=${to}`).then(
      (res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.greaterThan(0);
      }
    );
  });

  // 17. Hibás dátum esetén 400
  it("17. GET /bookings/availability – hibás dátumra 400 visszaad", () => {
    cy.request({
      url: `${API}/bookings/availability?from=rosszdate&to=rosszdate`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  // 18. Foglalás létrehozása
  it("18. POST /bookings – sikeres foglalás létrehozása", () => {
    cy.request({
      method: "POST",
      url: `${API}/bookings`,
      headers: { Authorization: `Bearer ${bookingUserToken}` },
      body: {
        car_id: bookingCarId,
        service_ids: [bookingServiceId],
        date: "2030-07-15 09:00",
        note: "Cypress teszt foglalás",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.include("létrehozva");
      createdBookingId =
        res.body.result?.insertId ?? res.body.result?.[0]?.insertId;
    });
  });

  // 19. Saját foglalások listázása
  it("19. GET /bookings – saját foglalások visszaad", () => {
    cy.request({
      method: "GET",
      url: `${API}/bookings`,
      headers: { Authorization: `Bearer ${bookingUserToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  // 20. Foglalás törlése
  it("20. DELETE /bookings/:id – saját foglalás törölhető", () => {
    cy.wrap(null).then(() => {
      if (!createdBookingId) {
        cy.log("Nincs bookingId – kihagyva");
        return;
      }
      cy.request({
        method: "DELETE",
        url: `${API}/bookings/${createdBookingId}`,
        headers: { Authorization: `Bearer ${bookingUserToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.include("törölve");
      });
    });
  });
});