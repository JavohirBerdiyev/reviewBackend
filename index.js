const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Middleware to parse request body as JSON
app.use(express.json());
app.use(cors());

// POST /comments endpoint handler
app.post("/comments", async (req, res) => {
  const { name, phone_number, message, range } = req.body;
  try {
    // Insert new comment into database
    const result = await pool.query(
      "INSERT INTO comments (name, phone_number, message, range) VALUES ($1, $2, $3, $4) RETURNING*",
      [name, phone_number, message, range]
    );
    // Respond with success message
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save comment" });
  }
});

// GET /comments endpoint handler
app.get("/comments", async (req, res) => {
  try {
    // Retrieve all comments from database
    const { rows: data } = await pool.query("SELECT * FROM comments");

    // Respond with data
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get comments" });
  }
});

// DELETE /comments/:id endpoint handler
app.delete("/comments/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Delete comment with given ID from database
    const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING *", [id]);

    // Check if comment was deleted successfully
    if (result.rowCount === 0) {
      res.status(404).json({ error: `Comment with ID ${id} not found` });
    } else {
      res.status(200).json({ message: `Comment with ID ${id} deleted successfully` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Start server listening on port 3000
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});