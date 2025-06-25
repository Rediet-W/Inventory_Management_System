describe("Authentication Flow", () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = "TestPassword123!";
  const name = "Test User";

  it("registers, logs out, and logs in again", () => {
    // Register
    cy.visit("/register");
    cy.get('input[placeholder="Enter name"]').type(name);
    cy.get('input[placeholder="Enter email"]').type(uniqueEmail);
    cy.get('input[placeholder="Enter password"]').type(password);
    cy.get('input[placeholder="Confirm password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Should be redirected (to / or /dashboard), and see a welcome or dashboard element
    cy.url().should("not.include", "/register");
    cy.contains(/dashboard|welcome/i, { matchCase: false }).should("exist");

    // Wait for ALL Toastify toasts to disappear
    cy.get(".Toastify__toast", { timeout: 10000 }).should("not.exist");

    // Optionally, add a short wait to ensure UI is ready (uncomment if needed)
    // cy.wait(500);

    // Open the user dropdown (click the avatar or name in the navbar)
    cy.get("#username").click({ force: true });

    // Click the "Logout" item in the dropdown
    cy.contains(".dropdown-item", "Logout").click({ force: true });

    // Should be redirected to login
    cy.url().should("include", "/login");
    cy.contains("Please sign in to continue").should("exist");

    // Log in again
    cy.get('input[placeholder="Enter email"]').type(uniqueEmail);
    cy.get('input[placeholder="Enter password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Should be redirected and see dashboard/home
    cy.url().should("not.include", "/login");
    cy.contains(/dashboard|welcome/i, { matchCase: false }).should("exist");
  });

  it("shows error on invalid credentials", () => {
    cy.visit("/login");
    cy.get('input[placeholder="Enter email"]').type("wronguser@example.com");
    cy.get('input[placeholder="Enter password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    cy.contains(/login failed|invalid/i, { matchCase: false }).should("exist");
  });

  it("shows error if passwords do not match on register", () => {
    cy.visit("/register");
    cy.get('input[placeholder="Enter name"]').type("Mismatch User");
    cy.get('input[placeholder="Enter email"]').type(
      `mismatch_${Date.now()}@example.com`
    );
    cy.get('input[placeholder="Enter password"]').type("password1");
    cy.get('input[placeholder="Confirm password"]').type("password2");
    cy.get('button[type="submit"]').click();

    cy.contains(/passwords do not match/i).should("exist");
  });
});
