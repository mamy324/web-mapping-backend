const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

router.post("/", async (req,res)=>{

const {name,email,password} = req.body;

try{

// vérifier si email existe
const user = await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
);

if(user.rows.length>0){
 return res.status(400).json("email already exists");
}

// hash password
const hashedPassword = await bcrypt.hash(password,10);

// créer utilisateur
await pool.query(
"INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
[name,email,hashedPassword]
);

res.json("user created");

}catch(err){

console.log(err);
res.status(500).json("server error");

}

});

module.exports = router;