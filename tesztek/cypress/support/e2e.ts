/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaApi(email: string, password: string): Chainable<string>;
      loginViaUI(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginViaApi", (email: string, password: string) => {
  return cy
    .request("POST", `${Cypress.env("apiUrl")}/auth/login`, { email, password })
    .then((res) => {
      const token: string = res.body.token;
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("user", JSON.stringify(res.body.user));
      return token;
    });
});

Cypress.Commands.add("loginViaUI", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

export {};
