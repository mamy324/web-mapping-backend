const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const pool = require("../db");

router.post("/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1 AND reset_token_expire > NOW()",
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "Token invalide ou expiré" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users 
       SET password=$1, reset_token=NULL, reset_token_expire=NULL 
       WHERE reset_token=$2`,
      [hashedPassword, token]
    );

    res.json({ msg: "Mot de passe mis à jour" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

module.exports = router; // ✅ IMPORTANT
