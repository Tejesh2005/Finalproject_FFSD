const express = require('express');
const router = express.Router();


router.get('/approvedcars',(req,res)=>{
    res.render('auctionmanager/approvedcars.ejs')
  })

module.exports = router;