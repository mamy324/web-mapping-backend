
const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {

    const query = `
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'type','Feature',
              'geometry', ST_AsGeoJSON(geom)::jsonb,
              'properties', jsonb_build_object(
                'gid', gid,
                'fokontany', fokontany,
                'total1', total1,
                'eau_moyen', eau_moyen
              )
            )
          ),
          '[]'::jsonb
        )
      ) AS geojson
      FROM etudiant;
    `;

    const { rows } = await pool.query(query);

    res.json(rows[0].geojson);

  } catch (error) {
    console.error("Erreur API :", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;