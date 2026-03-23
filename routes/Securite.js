const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {

  try {

    let typesParam = req.query.types || "";
    let selectedTypes = [];

    // filtre sécurité
    if (typeof typesParam === "string" && typesParam.trim() !== "") {

      selectedTypes = typesParam
        .split(",")
        .map(t => t.trim())
        .filter(t => ["securite1", "moyennesec", "peusecu"].includes(t));

    }

    // si aucun filtre → tout afficher
    if (selectedTypes.length === 0) {
      selectedTypes = ["securite1", "moyennesec", "peusecu"];
    }

    const matchExpression = selectedTypes.join(" + ");

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

                -- valeurs sécurité
                'securite1', securite1,
                'moyennesec', moyennesec,
                'peusecu', peusecu,

                -- pourcentage sécurité

                'securite_pct', ROUND(
                  CAST(
                    (securite1 * 100.0) /
                    NULLIF(securite1 + moyennesec + peusecu,0)
                  AS numeric),2
                ),

                'moyennesec_pct', ROUND(
                  CAST(
                    (moyennesec * 100.0) /
                    NULLIF(securite1 + moyennesec + peusecu,0)
                  AS numeric),2
                ),

                'peusecu_pct', ROUND(
                  CAST(
                    (peusecu * 100.0) /
                    NULLIF(securite1 + moyennesec + peusecu,0)
                  AS numeric),2
                ),

                -- logement (information)

                'location1', location1,
                'famille1', famille1,
                'coloque', coloque,
                'cite', cite,

                -- filtre sécurité

                'filter_match',

                CASE
                  WHEN (${matchExpression}) IS NULL THEN 0
                  ELSE (${matchExpression})
                END

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

    res.status(500).json({
      error: error.message
    });

  }

});

module.exports = router;