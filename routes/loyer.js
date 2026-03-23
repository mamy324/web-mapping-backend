/*const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {

    // récupérer les valeurs du slider
    const minPrix = parseInt(req.query.minPrix) || 0;
    const maxPrix = parseInt(req.query.maxPrix) || 100000;

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::jsonb,
              'properties', jsonb_build_object(
                'gid', gid,
                'fokontany', fokontany,
                'total1', total1,
                'loge_moyen', loge_moyen
              )
            )
          ), 
          '[]'::jsonb
        )
      ) AS geojson
      FROM etudiant
      WHERE loge_moyen BETWEEN $1 AND $2;
    `;

    const { rows } = await pool.query(query, [minPrix, maxPrix]);

    res.json(rows[0].geojson);

  } catch (error) {
    console.error("Erreur API :", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
*/


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
                'loge_moyen', loge_moyen
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