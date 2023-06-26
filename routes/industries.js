const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /industries
// Lists all industries with associated company codes.
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT i.code, i.industry, array_agg(ci.comp_code) AS company_codes FROM industries i LEFT JOIN company_industries ci ON i.code = ci.industry_code GROUP BY i.code, i.industry"
    );
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(new ExpressError("Unable to retrieve industries", 500));
  }
});

// POST /industries
// Adds an industry.
router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(new ExpressError("Unable to add industry", 500));
  }
});

module.exports = router;