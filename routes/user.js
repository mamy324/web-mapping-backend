

const router = require("express").Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const SECRET = "secretkey";

router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Pas de token → on retourne utilisateur vide (PAS 401)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ name: "", initials: "" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      // ✅ Token invalide → on renvoie vide sans erreur
      return res.json({ name: "", initials: "" });
    }

    if (!decoded.id) {
      return res.json({ name: "", initials: "" });
    }

    const userQuery = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userQuery.rows.length === 0) {
      return res.json({ name: "", initials: "" });
    }

    const name = userQuery.rows[0].name || "User";
    const initials = name.trim().slice(0, 2).toUpperCase();

    res.json({ name, initials });

  } catch (err) {
    console.error("Erreur serveur:", err);
    
    // ❌ NE PAS envoyer 401
    res.json({ name: "", initials: "" });
  }
});

module.exports = router;


