describe("Add Product and Transfer Flow", () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "12345678";
  const timestamp = Date.now();
  const batchNumber = `BATCH-test`;
  const productName = `Test Product`;
  const reference = "Initial Stock";
  const uom = "pcs";
  const quantity = 10;
  const unitCost = 25.5;
  const quantityToTransfer = 2;
  const reorderLevel = 1;

  before(() => {
    cy.visit("/login");
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
  });

  it("should add a new purchase/product and transfer it", () => {
    cy.visit("/add-products");

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("input").eq(0).type(batchNumber);
        cy.get("input").eq(1).type(productName);
        cy.get("input").eq(2).type(reference);
        cy.get("input").eq(3).type(uom);
        cy.get("input").eq(4).clear().type(quantity);
        cy.get("input").eq(5).clear().type(unitCost);
      });

    cy.contains("Submit Purchases").click();
    cy.contains("Purchases added successfully!").should("exist");
    cy.contains("Download Purchase Receipt").should("exist");
    cy.contains("No, Thanks").click();
    cy.get("tbody tr").first().find("input").eq(0).should("have.value", "");

    // --- Transfer Product ---
    cy.visit("/transfer");

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("select").select(productName);
      });

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("input[type='number']").eq(0).clear().type(quantityToTransfer);
        cy.get("input[type='number']").eq(1).clear().type(reorderLevel);
      });

    cy.contains("Complete Transfer").click();
    cy.contains("Transfers completed successfully!").should("exist");
    cy.contains("Download Transfer Report").should("exist");
    cy.contains("Cancel").click();
  });
});
