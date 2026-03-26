import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {},
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
  env: {
    apiUrl: "http://localhost:3000/api",
    adminEmail: "admin@autoszerviz.local",
    adminPassword: "admin123",
    userEmail: "tesztuser@email.hu",
    userPassword: "teszt123",
    userName: "Teszt Elek",
    userPhone: "+36301234567",
  },
});
