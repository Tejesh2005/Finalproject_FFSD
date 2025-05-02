const express = require('express');
const router = express.Router()


router.get('/pending-car-details',(req,res)=>{
    res.render('auctionmanager/pending-car-details.ejs')
  })

  module.exports = router;
  