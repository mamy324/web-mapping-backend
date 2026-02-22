const express = require("express");
const cors = require("cors");

const countriesRoutes = require("./routes/countries");
const logementRoutes = require("./routes/logement");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/countries", countriesRoutes);
app.use("/api/logement", logementRoutes); 

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
