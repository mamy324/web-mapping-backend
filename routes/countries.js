
const express = require("express");
const router = express.Router();
const pool = require("../db");

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
              'adresse', fokontany,
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

module.exports = router;
