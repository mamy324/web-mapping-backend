const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async(req,res)=>{

const {email,password} = req.body;

try{

const user = await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
);

if(user.rows.length === 0){
 return res.status(400).json("user not found");
}

// vérifier password
const validPassword = await bcrypt.compare(
password,
user.rows[0].password
);

if(!validPassword){
 return res.status(400).json("wrong password");
}

// créer token
const token = jwt.sign(
 {id:user.rows[0].id},
 "secretkey",
 {expiresIn:"24h"}
);

res.json({token});

}catch(err){

console.log(err);
res.status(500).json("server error");

}

});

module.exports = router;