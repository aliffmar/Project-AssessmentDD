const express = require("express");
const router = express.Router();

router.get('/', (req,res)=>{
    res.send({
        'message':'API working'
    })
})

module.exports = router;