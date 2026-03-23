

const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    let typesParam = req.query.types || "";
    let selectedTypes = [];

    if (typeof typesParam === "string" && typesParam.trim() !== "") {
      selectedTypes = typesParam
        .split(",")
        .map(t => t.trim())
        .filter(t => ["location1", "famille1", "coloque", "cite"].includes(t));
    }

    if (selectedTypes.length === 0) {
      selectedTypes = ["location1", "famille1", "coloque", "cite"];
    }

    const matchExpression = selectedTypes.join(" + ");

    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'gid', gid,
              'fokontany', fokontany,
               'total1', total1,
              'location_pct', ROUND( CAST(
                (location1 * 100.0) /
                NULLIF(location1 + famille1 + coloque + cite, 0)
              AS numeric ), 2),

              'famille_pct', ROUND( CAST(
                (famille1 * 100.0) /
                NULLIF(location1 + famille1 + coloque + cite, 0)
              AS numeric ), 2),

              'coloque_pct', ROUND( CAST(
                (coloque * 100.0) /
                NULLIF(location1 + famille1 + coloque + cite, 0)
              AS numeric ), 2),

              'cite_pct', ROUND( CAST(
                (cite * 100.0) /
                NULLIF(location1 + famille1 + coloque + cite, 0)
              AS numeric ), 2),

              'filter_match',
                CASE
                  WHEN (${matchExpression}) IS NULL THEN 0
                  ELSE (${matchExpression})
                END
            )
          )
        ), '[]'::jsonb)
      ) AS geojson
      FROM etudiant;
    `;

    const { rows } = await pool.query(query);
    res.json(rows[0].geojson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


