const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /invoices
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ "invoices": result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /invoices/:id
// Returns obj on given invoice.
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code) WHERE i.id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID ${id} not found`, 404);
    }

    const { amt, paid, add_date, paid_date, code, name, description } = result.rows[0];
    const invoice = {
      id,
      amt,
      paid,
      add_date,
      paid_date,
      company: {
        code,
        name,
        description,
      },
    };

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});


// POST /invoices
// Adds an invoice.
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );

    const { id, paid, add_date, paid_date } = result.rows[0];
    const invoice = {
      id,
      comp_code,
      amt,
      paid,
      add_date,
      paid_date,
    };

    return res.status(201).json({ invoice });
  } catch (err) {
    return next(err);
  }
});


// PUT /invoices/:id
// Updates an invoice.
// Needs to be passed in a JSON body of {amt, paid}
// If paying unpaid invoice: sets paid_date to today
// If un-paying: sets paid_date to null
// Else: keep current paid_date
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    const result = await db.query(
      "UPDATE invoices SET amt = $1, paid = $2, paid_date = CASE WHEN $2 = true AND paid = false THEN CURRENT_DATE WHEN $2 = false THEN null ELSE paid_date END WHERE id = $3 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, paid, id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID ${id} not found`, 404);
    }

    const invoice = result.rows[0];
    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

// DELETE /invoices/:id
// Deletes an invoice.
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID ${id} not found`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
