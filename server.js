
/*const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const passport = require("./config/passport");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const countriesRoutes = require("./routes/countries");
const logementRoutes = require("./routes/logement");
const loyerRoutes = require("./routes/loyer");
const cout_eauRoutes = require("./routes/couteau");
const securiteRoutes = require("./routes/Securite");
const eauRoutes = require("./routes/eau");
const electriciteRoutes = require("./routes/electricite");
const factureRoutes = require("./routes/facture");
const toiletteRoutes = require("./routes/toilette");
const etatRoutes = require("./routes/etat");

const authRoutes = require("./routes/auth");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");



const tableRoutes = require("./routes/table");



const app = express();

app.use(cors());
app.use(express.json());

app.use(
 session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
 })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/register",registerRoutes);
app.use("/api/login",loginRoutes);

app.use("/admin", adminRoutes);


app.use("/api/table", tableRoutes);



app.use("/api/user",userRoutes);

app.use("/api/countries", countriesRoutes);
app.use("/api/logement", logementRoutes); 
app.use("/api/loyer", loyerRoutes);
app.use("/api/cout_eau", cout_eauRoutes);
app.use("/api/securite", securiteRoutes); 
app.use("/api/eau", eauRoutes);
app.use("/api/electricite", electriciteRoutes);
app.use("/api/facture", factureRoutes);
app.use("/api/toilette", toiletteRoutes);
app.use("/api/etat", etatRoutes);



const PORT = 8000;

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});


*/

const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const passport = require("./config/passport");

// 🔹 Routes principales
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const countriesRoutes = require("./routes/countries");
const logementRoutes = require("./routes/logement");
const loyerRoutes = require("./routes/loyer");
const cout_eauRoutes = require("./routes/couteau");
const securiteRoutes = require("./routes/Securite");
const eauRoutes = require("./routes/eau");
const electriciteRoutes = require("./routes/electricite");
const factureRoutes = require("./routes/facture");
const toiletteRoutes = require("./routes/toilette");
const etatRoutes = require("./routes/etat");

const authRoutes = require("./routes/auth");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");

// ✅ AJOUT OBLIGATOIRE (forgot + reset)
const forgotpasswordRoutes = require("./routes/forgotPassword");
const resetpasswordRoutes = require("./routes/resetpassword");

const tableRoutes = require("./routes/table");

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 🔹 Auth
app.use("/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);

// 🔹 Admin
app.use("/admin", adminRoutes);

// 🔹 Autres routes
app.use("/api/table", tableRoutes);
app.use("/api/user", userRoutes);

// ✅ FORGOT + RESET (IMPORTANT)
app.use("/api/forgotpassword", forgotpasswordRoutes);
app.use("/api/resetpassword", resetpasswordRoutes);

// 🔹 Données
app.use("/api/countries", countriesRoutes);
app.use("/api/logement", logementRoutes);
app.use("/api/loyer", loyerRoutes);
app.use("/api/cout_eau", cout_eauRoutes);
app.use("/api/securite", securiteRoutes);
app.use("/api/eau", eauRoutes);
app.use("/api/electricite", electriciteRoutes);
app.use("/api/facture", factureRoutes);
app.use("/api/toilette", toiletteRoutes);
app.use("/api/etat", etatRoutes);

// 🔹 Server
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

