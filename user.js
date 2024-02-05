const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {getDB} = require('./mongoUtil');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

router.post('/', async function(req, res){
 
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            username: req.body.username,
            password: hashedPassword
        };
        const db = getDB();
        const results = await db.collection("users").insertOne(newUser);
        res.json({
            results
        });
   

});

module.exports = router;
