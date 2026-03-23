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
        .filter(t => ["jirama2","puits_1","pompe1"].includes(t));

    }

    if (selectedTypes.length === 0) {
      selectedTypes = ["jirama2","puits_1","pompe1"];
    }

    const matchExpression = selectedTypes.join(" + ");

    console.log("TYPES BACKEND :", selectedTypes);

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

                'jirama2', jirama2,
                'puits_1', puits_1,
                'pompe1', pompe1,

                'selected_total', (${matchExpression}),

                'jirama_pct', ROUND(
                  CAST((jirama2 * 100.0) /
                  NULLIF(jirama2 + puits_1 + pompe1,0) AS numeric),2
                ),

                'puits_pct', ROUND(
                  CAST((puits_1 * 100.0) /
                  NULLIF(jirama2 + puits_1 + pompe1,0) AS numeric),2
                ),

                'pompe_pct', ROUND(
                  CAST((pompe1 * 100.0) /
                  NULLIF(jirama2 + puits_1 + pompe1,0) AS numeric),2
                )

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

  }

  catch (error) {

    console.error(error);

    res.status(500).json({ error: error.message });

  }

});

module.exports = router;