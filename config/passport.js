/*const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db");

passport.use(
 new GoogleStrategy(
  {
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   callbackURL: "/auth/google/callback",
  },

  async (accessToken, refreshToken, profile, done) => {

   try{

   const googleId = profile.id;
   const name = profile.displayName;
   const email = profile.emails[0].value;

   // vérifier si utilisateur existe
   const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
   );

   if(user.rows.length === 0){

    // créer utilisateur
    await pool.query(
     "INSERT INTO users(name,email,google_id) VALUES($1,$2,$3)",
     [name,email,googleId]
    );

    console.log("Utilisateur enregistré");

   }else{

    console.log("Utilisateur déjà existant");

   }

   return done(null, profile);

   }catch(err){

    console.log(err);
    return done(err,null);

   }

  }
 )
);

passport.serializeUser((user, done) => {
 done(null, user);
});

passport.deserializeUser((user, done) => {
 done(null, user);
});

module.exports = passport;*/


const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName || "User";
        const email = profile.emails[0]?.value;

        if (!email) {
          return done(new Error("Email non fourni par Google"), null);
        }

        // Vérifier si l'utilisateur existe (par email ou par google_id)
        let user = await pool.query(
          "SELECT id, name, email FROM users WHERE email = $1 OR google_id = $2",
          [email, googleId]
        );

        if (user.rows.length === 0) {
          // Créer l'utilisateur
          const newUser = await pool.query(
            `INSERT INTO users (name, email, google_id)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, googleId]
          );

          console.log("✅ Nouvel utilisateur Google créé");
          return done(null, newUser.rows[0]);   // ← Important : on passe l'utilisateur de la BDD
        } else {
          // Mise à jour du nom + google_id (au cas où)
          const updatedUser = await pool.query(
            `UPDATE users 
             SET name = $1, google_id = $2 
             WHERE id = $3 
             RETURNING id, name, email`,
            [name, googleId, user.rows[0].id]
          );

          console.log("✅ Utilisateur Google mis à jour");
          return done(null, updatedUser.rows[0]);
        }
      } catch (err) {
        console.error("Erreur Google Strategy :", err);
        return done(err, null);
      }
    }
  )
);

// ====================== SERIALIZE / DESERIALIZE ======================
passport.serializeUser((user, done) => {
  done(null, user.id);           // On ne sauvegarde QUE l'id de notre table users
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return done(new Error("Utilisateur non trouvé"), null);
    }
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

