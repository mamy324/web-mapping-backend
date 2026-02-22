

require('dotenv').config();

/*console.log("=== VARIABLES APRÈS dotenv ===");
console.log("DB_HOST →", process.env.DB_HOST);
console.log("DB_PORT →", process.env.DB_PORT);
console.log("DB_USER →", process.env.DB_USER);
console.log("DB_PASSWORD →", process.env.DB_PASSWORD);
console.log("DB_NAME  →", process.env.DB_NAME);*/



// Le reste de ton code pool ici...
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "logement",
});

module.exports = pool;