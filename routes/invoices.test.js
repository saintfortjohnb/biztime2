const request = require("supertest");
const app = require("../app");
const db = require("../db");

afterAll(async () => {
  // Close the database connection after all tests
  await db.end();
});

describe("GET /invoices", () => {
  test("Should get a list of invoices", async () => {
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("invoices");
    expect(response.body.invoices).toBeInstanceOf(Array);
  });
});

describe("GET /invoices/:id", () => {
  test("Should get a specific invoice", async () => {
    const response = await request(app).get("/invoices/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("invoice");
    expect(response.body.invoice).toHaveProperty("id", "1");
  });

  test("Should return 404 for non-existent invoice", async () => {
    const response = await request(app).get("/invoices/999");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("Should add a new invoice", async () => {
    const newInvoice = {
      comp_code: "apple",
      amt: 500,
    };
    const response = await request(app).post("/invoices").send(newInvoice);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("invoice");
    expect(response.body.invoice).toHaveProperty("id");
    expect(response.body.invoice).toMatchObject(newInvoice);

    testInvoiceId = response.body.invoice.id;
  });
});

describe("PUT /invoices/:id", () => {
  test("Should update an existing invoice and handle payment", async () => {
    const updatedInvoice = {
      amt: 600,
      paid: true, // Paying the invoice
    };
    const response = await request(app).put("/invoices/1").send(updatedInvoice);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("invoice");
    expect(response.body.invoice).toHaveProperty("id", 1);
    expect(response.body.invoice).toMatchObject(updatedInvoice);
    
    const expectedDate = new Date().toISOString().substr(0, 10);
    const receivedDate = response.body.invoice.paid_date.substr(0, 10);
    expect(receivedDate).toBe(expectedDate); // Verify that paid_date is set to today's date
  });

  test("Should un-pay an existing invoice", async () => {
    const updatedInvoice = {
      amt: 600,
      paid: false, // Un-paying the invoice
    };
    const response = await request(app).put("/invoices/1").send(updatedInvoice);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("invoice");
    expect(response.body.invoice).toHaveProperty("id", 1);
    expect(response.body.invoice).toMatchObject(updatedInvoice);
    expect(response.body.invoice.paid_date).toBeNull(); // Verify that paid_date is set to null
  });

  test("Should return 404 for non-existent invoice", async () => {
    const updatedInvoice = {
      amt: 600,
      paid: true,
    };
    const response = await request(app).put("/invoices/999").send(updatedInvoice);
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:id", () => {
  test("Should delete an existing invoice", async () => {
    const response = await request(app).delete(`/invoices/${testInvoiceId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "deleted");
  });

  test("Should return 404 for non-existent invoice", async () => {
    const response = await request(app).delete("/invoices/999");
    expect(response.statusCode).toBe(404);
  });
});
