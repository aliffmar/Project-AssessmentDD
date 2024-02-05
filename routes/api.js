const express = require("express");
const router = express.Router();

app.get('/', (req,res)=>{
    res.send({
        'message':'API working'
    })
})

module.exports = router;