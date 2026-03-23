/*const router = require("express").Router();
const passport = require("passport");

router.get(
 "/google",
 passport.authenticate("google",{scope:["profile","email"]})
);

router.get(
 "/google/callback",
 passport.authenticate("google",{failureRedirect:"/"}),
 (req,res)=>{

  const token = "google_user";

  res.redirect(`http://localhost:3000/dashboard?token=${token}`);

 }
);

module.exports = router;*/


const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      // req.user vient de deserializeUser → il contient { id, name, email }
      const payload = {
        id: req.user.id,
        email: req.user.email,
        // tu peux ajouter name si tu veux, mais pas obligatoire
      };

      // Génère un vrai JWT (change "secretkey" par process.env.JWT_SECRET en production !)
      const token = jwt.sign(payload, "secretkey", { 
        expiresIn: "7d"   // 7 jours, tu peux mettre "1h" ou "30d" selon tes besoins
      });

      // Redirection vers le frontend avec le vrai token
      res.redirect(`http://localhost:3000/dashboard?token=${token}`);

    } catch (err) {
      console.error("Erreur génération token Google:", err);
      res.redirect("http://localhost:3000/?error=auth_failed");
    }
  }
);

module.exports = router;