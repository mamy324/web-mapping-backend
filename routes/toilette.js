const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {

  try {

    let typesParam = req.query.types || "";
    let selectedTypes = [];

    /* récupération filtres */

    if (typeof typesParam === "string" && typesParam.trim() !== "") {

      selectedTypes = typesParam
        .split(",")
        .map(t => t.trim())
        .filter(t => ["tradi","moderne1","commune1"].includes(t));

    }

    /* si aucun filtre */

    if (selectedTypes.length === 0) {
      selectedTypes = ["tradi","moderne1","commune1"];
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

                'selected_total', (${matchExpression}),

                'tradi_pct', ROUND(
                  CAST(
                    (tradi * 100.0) /
                    NULLIF(tradi + moderne1 + commune1,0)
                  AS numeric)
                ,2),

                'moderne_pct', ROUND(
                  CAST(
                    (moderne1 * 100.0) /
                    NULLIF(tradi + moderne1 + commune1,0)
                  AS numeric)
                ,2),

                'commune_pct', ROUND(
                  CAST(
                    (commune1 * 100.0) /
                    NULLIF(tradi + moderne1 + commune1,0)
                  AS numeric)
                ,2)

              )

            )

          ),

          '[]'::jsonb

        )

      ) AS geojson

      FROM etudiant
      WHERE geom IS NOT NULL;

    `;

    const { rows } = await pool.query(query);

    res.json(rows[0].geojson);

  }

  catch (error) {

    console.error("ERREUR API :", error);
    res.status(500).json({ error: error.message });

  }

});

module.exports = router;