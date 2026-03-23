const express = require("express");
const router = express.Router();
const pool = require("../db");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 GET GEOJSON
router.get("/", async (req, res) => {
  try {
    const max = req.query.max ? parseInt(req.query.max) : null;

    const query = `
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type','Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'gid', gid,
              'fokontany', fokontany,
              'total', total_1,
              'homme', homme_1,
              'femme', femme_1,
              'licence1', l1a,
              'licence2', l2a,
              'licence3', l3a,
              'master1', m1a,
              'master2', m2a
            )
          )
        ), '[]')
      ) AS geojson
      FROM fokontany
      WHERE ($1::int IS NULL OR total_1 <= $1);
    `;

    const { rows } = await pool.query(query, [max]);

    res.json(rows[0].geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// 🔹 UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fokontany,
      total,
      homme,
      femme,
      licence1,
      licence2,
      licence3,
      master1,
      master2,
    } = req.body;

    const query = `
      UPDATE fokontany
      SET 
        fokontany = $1,
        total_1 = $2,
        homme_1 = $3,
        femme_1 = $4,
        l1a = $5,
        l2a = $6,
        l3a = $7,
        m1a = $8,
        m2a = $9
      WHERE gid = $10
    `;

    await pool.query(query, [
      fokontany,
      total,
      homme,
      femme,
      licence1,
      licence2,
      licence3,
      master1,
      master2,
      id,
    ]);
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/export", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM fokontany");

    let csv = "fokontany,total,homme,femme,l1,l2,l3,m1,m2\n";

    result.rows.forEach((row) => {
      csv += `${row.fokontany},${row.total_1},${row.homme_1},${row.femme_1},${row.l1a},${row.l2a},${row.l3a},${row.m1a},${row.m2a}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("data.csv");
    res.send(csv);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
///////
///////
router.post("/import", upload.single("file"), async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const geojson = JSON.parse(req.file.buffer.toString());

    // SUPPRIMER AVANT IMPORT (transaction)
    await client.query("TRUNCATE TABLE fokontany RESTART IDENTITY");

    for (const feature of geojson.features) {
      const geom = JSON.stringify(feature.geometry);
      const p = feature.properties;

// 
    const data = {
    fokontany: p.fokontany || p.FOKONTANY,
    total: p.total || p.TOTAL_1,
    homme: p.homme || p.HOMME_1,
    femme: p.femme || p.FEMME_1,
    licence1: p.licence1 || p.L1A,
    licence2: p.licence2 || p.L2A,
    licence3: p.licence3 || p.L3A,
    master1: p.master1 || p.M1A,
    master2: p.master2 || p.M2A,
};

      await client.query(
        `
        INSERT INTO fokontany (
          geom,
          fokontany,
          total_1,
          homme_1,
          femme_1,
          l1a,
          l2a,
          l3a,
          m1a,
          m2a
        )
        VALUES (
          ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
          $2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        `,
        [
          geom,
          data.fokontany,
          data.total,
          data.homme,
          data.femme,
          data.licence1,
          data.licence2,
          data.licence3,
          data.master1,
          data.master2,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Import réussi" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });

  } finally {
    client.release();
  }
});
//////
router.get("/stats", async (req, res) => {
  try {
    // 🔹 utilisateurs
    const users = await pool.query("SELECT COUNT(*) FROM users");

    // 🔹 total étudiants
    const total = await pool.query("SELECT SUM(total_1) FROM fokontany");

    // 🔹 fokontany dominant
    const dominant = await pool.query(`
      SELECT fokontany, total_1 
      FROM fokontany 
      ORDER BY total_1 DESC 
      LIMIT 1
    `);

    // 🔹 nombre fokontany actifs
    const nbFokontany = await pool.query(`
      SELECT COUNT(*) 
      FROM fokontany 
      WHERE total_1 > 0
    `);

    res.json({
      users: users.rows[0].count,
      totalEtudiants: total.rows[0].sum || 0,
      dominant: dominant.rows[0]?.fokontany || "Aucun",
      nbFokontany: nbFokontany.rows[0].count
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/////
router.get("/chart", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fokontany, total_1 AS total
      FROM fokontany
      ORDER BY total_1 DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
