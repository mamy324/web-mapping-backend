
const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

// LOGIN ADMIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si admin existe
    const result = await pool.query(
      "SELECT * FROM admins WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Email incorrect ❌" });
    }

    const admin = result.rows[0];

    // Comparer mot de passe
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.json({ success: false, message: "Mot de passe incorrect ❌" });
    }

    // Générer token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET all admins
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM admins ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } 
});

// ADD admin
router.post("/add", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Vérifier champs vides
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "❌ Tous les champs sont obligatoires"
      });
    }

    // ✅ Vérifie email existant
    const check = await pool.query(
      "SELECT id FROM admins WHERE email=$1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "❌ Email déjà utilisé"
      });
    }

    // ✅ Validation password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "❌ Mot de passe invalide (min 8 caractères, 1 majuscule, 1 chiffre)"
      });
    }

    //  Hash password
    const hashed = await bcrypt.hash(password, 10);

    //  Insertion
    await pool.query(
      "INSERT INTO admins(name,email,password) VALUES($1,$2,$3)",
      [name, email, hashed]
    );

    //  Succès
    return res.status(201).json({
      success: true,
      message: "✅ Admin ajouté avec succès"
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur ❌"
    });
  }
});
 
// DELETE admin
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM admins WHERE id=$1", [id]);
    res.json({ message: "✅ Admin supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
/////modifier
router.put("/update-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Vérification mot de passe : minimum 8 caractères, 1 majuscule, 1 chiffre
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "❌ Mot de passe invalide (8 caractères, 1 majuscule, 1 chiffre)"
      });
    }

    // Hash du mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Mise à jour dans la base
    await pool.query(
      "UPDATE admins SET password=$1 WHERE id=$2",
      [hashed, id]
    );

    return res.json({
      success: true,
      message: "✅ Mot de passe modifié avec succès"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur ❌"
    });
  }
});
module.exports = router;

