const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../db");

// ✅ ROUTE
router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 3600000);

    await pool.query(
      "UPDATE users SET reset_token=$1, reset_token_expire=$2 WHERE email=$3",
      [token, expire, email]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tonemail@gmail.com",
        pass: "mot_de_passe_app"
      }
    });

    const resetLink = `http://localhost:3000/resetpassword/${token}`;

    await transporter.sendMail({
      from: "App",
      to: email,
      subject: "Reset Password",
      html: `<a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ msg: "Email envoyé" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

module.exports = router; // ✅ IMPORTANT
