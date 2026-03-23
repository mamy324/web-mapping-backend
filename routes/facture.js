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
        .filter(t =>
          ["paierien1", "abordable1", "assezcher1", "trescher1"].includes(t)
        );
    }

    if (selectedTypes.length === 0) {
      selectedTypes = ["paierien1", "abordable1", "assezcher1", "trescher1"];
    }

    const matchExpression = selectedTypes.join(" + ");

    const query = `
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features',COALESCE(jsonb_agg(
          jsonb_build_object(
            'type','Feature',
            'geometry',ST_AsGeoJSON(geom)::jsonb,
            'properties',jsonb_build_object(

              'gid',gid,
              'fokontany',fokontany,
              'total1',total1,
              'electricit',electricit,
              'gratuit_pct',ROUND(
                CAST(
                  (paierien1 * 100.0) /
                  NULLIF(paierien1 + abordable1 + assezcher1 + trescher1,0)
                AS numeric),2
              ),

              'abordable_pct',ROUND(
                CAST(
                  (abordable1 * 100.0) /
                  NULLIF(paierien1 + abordable1 + assezcher1 + trescher1,0)
                AS numeric),2
              ),

              'assezcher_pct',ROUND(
                CAST(
                  (assezcher1 * 100.0) /
                  NULLIF(paierien1 + abordable1 + assezcher1 + trescher1,0)
                AS numeric),2
              ),

              'trescher_pct',ROUND(
                CAST(
                  (trescher1 * 100.0) /
                  NULLIF(paierien1 + abordable1 + assezcher1 + trescher1,0)
                AS numeric),2
              ),

              'filter_match',
              COALESCE(${matchExpression},0)

            )
          )
        ),'[]'::jsonb)
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