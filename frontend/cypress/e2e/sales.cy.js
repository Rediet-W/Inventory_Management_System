describe("User Sale Flow", () => {
  const userEmail = "john@example.com";
  const userPassword = "12345678";
  const productName = `Test Product`;
  const saleQuantity = 1;

  it("should log in as user, make a sale, and see it in daily sales", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");

    cy.visit("/sales");

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("select", { timeout: 10000 }).then(($select) => {
          const options = [...$select[0].options].map((option) =>
            option.text.trim()
          );
          cy.log("Dropdown options:", options);
          const found = options.includes(productName);
          expect(found, `Product "${productName}" should appear in dropdown`).to
            .be.true;
        });
        cy.get("select").select(productName);

        cy.get("td")
          .eq(5)
          .invoke("text")
          .then((stockText) => {
            cy.log("In Stock for selected product:", stockText);
          });

        cy.get('input[type="number"]').first().clear().type(`${saleQuantity}`);
      });

    cy.contains("Submit Sale").click();

    cy.contains("Sales recorded successfully!").should("exist");

    cy.visit("/dailysales");

    cy.contains(productName).should("exist");
    cy.contains(saleQuantity).should("exist");
  });
});
