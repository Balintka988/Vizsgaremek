/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaUI(email: string, password: string): Chainable<void>;
    }
  }
}



Cypress.Commands.add("loginViaUI", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

export {};
