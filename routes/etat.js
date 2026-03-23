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
        .filter(t => ["bon1","moyen1","mauvais1"].includes(t));

    }

    /* si aucun filtre */

    if (selectedTypes.length === 0) {
      selectedTypes = ["bon1","moyen1","mauvais1"];
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

                'bon_pct', ROUND(
                  CAST(
                    (bon1 * 100.0) /
                    NULLIF(bon1 + moyen1 + mauvais1,0)
                  AS numeric)
                ,2),

                'moyen_pct', ROUND(
                  CAST(
                    (moyen1 * 100.0) /
                    NULLIF(bon1 + moyen1 + mauvais1,0)
                  AS numeric)
                ,2),

                'mauvais_pct', ROUND(
                  CAST(
                    (mauvais1 * 100.0) /
                    NULLIF(bon1 + moyen1 + mauvais1,0)
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