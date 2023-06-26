const request = require("supertest");
const app = require("../app");
const db = require("../db");

afterAll(async () => {
  // Close the database connection after all tests
  await db.end();
});

describe("GET /companies", () => {
  test("Should get a list of companies", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("companies");
    expect(response.body.companies).toBeInstanceOf(Array);
  });
});

describe("GET /companies/:code", () => {
  test("Should get a specific company", async () => {
    const response = await request(app).get("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("company");
    expect(response.body.company).toHaveProperty("code", "apple");
  });

  test("Should return 404 for non-existent company", async () => {
    const response = await request(app).get("/companies/nonexistent");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Should add a new company", async () => {
    const newCompany = {
      code: "microsoft",
      name: "Microsoft",
      description: "Technology company",
    };
    const response = await request(app).post("/companies").send(newCompany);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("company");
    expect(response.body.company).toHaveProperty("code");
    expect(response.body.company).toMatchObject(newCompany);
  });
});

describe("PUT /companies/:code", () => {
  test("Should update an existing company", async () => {
    const updatedCompany = {
      name: "Microsoft Inc.",
      description: "Technology company specializing in software",
    };
    const response = await request(app).put("/companies/microsoft").send(updatedCompany);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("company");
    expect(response.body.company).toHaveProperty("code", "microsoft");
    expect(response.body.company).toMatchObject(updatedCompany);
  });

  test("Should return 404 for non-existent company", async () => {
    const updatedCompany = {
      name: "Updated Company",
    };
    const response = await request(app).put("/companies/nonexistent").send(updatedCompany);
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Should delete an existing company", async () => {
    const response = await request(app).delete("/companies/microsoft");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "deleted");
  });

  test("Should return 404 for non-existent company", async () => {
    const response = await request(app).delete("/companies/nonexistent");
    expect(response.statusCode).toBe(404);
  });
});

describe("GET /companies/:code/industries", () => {
  test("Should get industries associated with a company", async () => {
    const response = await request(app).get("/companies/apple/industries");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("industries");
    expect(response.body.industries).toBeInstanceOf(Array);
  });

  test("Should return 404 for non-existent company", async () => {
    const response = await request(app).get("/companies/nonexistent/industries");
    expect(response.statusCode).toBe(404);
  });
});
