const { Pool } = require("pg");

// ────────────────────────────────────────────────
//   Mets TES vraies informations ici
// ────────────────────────────────────────────────
const pool = new Pool({
  host:     "localhost",           // ou 127.0.0.1
  port:     5432,
  user:     "postgres",            // ton utilisateur PostgreSQL
  password: "nicole", // ←←← CHANGE ÇA
  database: "logement",      // ←←← CHANGE ÇA (ex: postgres, gasy_db, etc.)
});

(async () => {
  let client;
  try {
    client = await pool.connect();
    
    console.log("=====================================");
    console.log("   ✅ CONNEXION POSTGRESQL RÉUSSIE !   ");
    console.log("=====================================");
    
    // Petit test supplémentaire : on liste les bases existantes
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log("\nBases de données visibles :");
    res.rows.forEach(row => console.log(" - " + row.datname));
    
  } catch (err) {
    console.log("=====================================");
    console.log("   ❌ ÉCHEC DE LA CONNEXION");
    console.log("=====================================");
    console.log("Message d'erreur :");
    console.error(err.message);
    
    if (err.code) {
      console.log("\nCode erreur PostgreSQL :", err.code);
    }
    if (err.stack) {
      console.log("\nDétails :", err.stack.split("\n")[0]);
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log("\nConnexion fermée.");
  }
})();