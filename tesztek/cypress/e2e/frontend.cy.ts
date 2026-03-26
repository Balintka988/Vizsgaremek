/// <reference types="cypress" />

const ADMIN_EMAIL = Cypress.env("adminEmail");
const ADMIN_PASSWORD = Cypress.env("adminPassword");
const API = Cypress.env("apiUrl");

describe("Frontend – Nyilvános oldalak navigációja", () => {
  it("1. Főoldal (/) – betölt és tartalmaz szöveget", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });

  it("2. /services – Szolgáltatások oldal betölt", () => {
    cy.visit("/services");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/services");
  });

  it("3. /about – Rólunk oldal betölt", () => {
    cy.visit("/about");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/about");
  });

  it("4. /contact – Kapcsolat oldal betölt", () => {
    cy.visit("/contact");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/contact");
  });

  it("5. /privacy – Adatvédelem oldal betölt", () => {
    cy.visit("/privacy");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/privacy");
  });
});

describe("Frontend – Login & Regisztráció", () => {
  it("6. /login – bejelentkezési form megjelenik", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain.text", "Bejelentkezés");
  });

  it("7. Login – rossz adatokkal hibaüzenet jelenik meg", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("nemletezik@email.hu");
    cy.get('input[type="password"]').type("rossz_jelszo");
    cy.get('button[type="submit"]').click();
    cy.get("p.text-red-600", { timeout: 6000 }).should("be.visible");
  });

  it("8. /register – regisztrációs form megjelenik", () => {
    cy.visit("/register");
    cy.get('input[name="name"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="phone"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain.text", "Regisztráció");
  });

  it("9. Regisztráció – sikeres regisztráció után átirányít /login-ra", () => {
    const uniqueEmail = `cypress_${Date.now()}@email.hu`;
    cy.visit("/register");
    cy.get('input[name="name"]').type("Cypress Teszt");
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="phone"]').type("+36305555555");
    cy.get('input[name="password"]').type("Jelszo123!");
    cy.get('button[type="submit"]').click();
    cy.get("p.text-green-600", { timeout: 6000 }).should("be.visible");
    cy.url({ timeout: 5000 }).should("include", "/login");
  });

  it("10. Regisztrációs oldal – 'Van már fiókja?' link átvisz /login-ra", () => {
    cy.visit("/register");
    cy.contains("Jelentkezzen be").click();
    cy.url().should("include", "/login");
  });
});

describe("Frontend – Felhasználói Dashboard (auth szükséges)", () => {
  let token: string;

  before(() => {
    const email = `dashtest_${Date.now()}@email.hu`;
    cy.request("POST", `${API}/auth/register`, {
      name: "Dash Tesztelő",
      email,
      phone: "+36306666666",
      password: "Teszt123!",
    }).then(() => {
      cy.request("POST", `${API}/auth/login`, {
        email,
        password: "Teszt123!",
      }).then((res) => {
        token = res.body.token;
        window.localStorage.setItem("token", token);
        window.localStorage.setItem("user", JSON.stringify(res.body.user));
      });
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("token", token);
    });
  });

  it("11. /dashboard – dashboard oldal betölt bejelentkezve", () => {
    cy.visit("/dashboard");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/dashboard");
  });

  it("12. /cars/new – autó hozzáadás form betölt", () => {
    cy.visit("/cars/new");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/cars/new");
  });

  it("13. /bookings/new – foglalás oldal betölt", () => {
    cy.visit("/bookings/new");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/bookings/new");
  });
});

describe("Frontend – Admin felület (admin auth szükséges)", () => {
  before(() => {
    cy.request("POST", `${API}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }).then((res) => {
      window.localStorage.setItem("token", res.body.token);
      window.localStorage.setItem("user", JSON.stringify(res.body.user));
    });
  });

  beforeEach(() => {
    cy.request("POST", `${API}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }).then((res) => {
      cy.window().then((win) => {
        win.localStorage.setItem("token", res.body.token);
        win.localStorage.setItem("user", JSON.stringify(res.body.user));
      });
    });
  });

  it("14. /admin – admin dashboard oldal betölt", () => {
    cy.visit("/admin");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/admin");
  });

  it("15. /admin/services – admin szolgáltatás oldal betölt", () => {
    cy.visit("/admin/services");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/admin/services");
  });
});

describe("Frontend – Navbar és Footer", () => {
  it("16. Főoldal – navbar megjelenik", () => {
    cy.visit("/");
    cy.get("nav").should("exist");
  });

  it("17. Főoldal – footer megjelenik", () => {
    cy.visit("/");
    cy.get("footer").should("exist");
  });

  it("18. Navbar – bejelentkezés link működik", () => {
    cy.visit("/");
    cy.get("a[href='/login']").first().click({ force: true });
    cy.url().should("include", "/login");
  });
});

describe("Frontend – Teljes login folyamat", () => {
  it("19. Admin login – sikeres belépés után /admin oldalra kerül", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type(ADMIN_EMAIL);
    cy.get('input[type="password"]').type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 8000 }).should("include", "/admin");
  });

  it("20. Login oldal – 'Vissza a főoldalra' gomb működik", () => {
    cy.visit("/login");
    cy.contains("Vissza a főoldalra").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });
});
