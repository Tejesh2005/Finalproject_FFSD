const express = require('express');
const router = express.Router();


router.get('/requests', (req,res)=>{
    res.render('auctionmanager/requests.ejs');
  });

  module.exports = router;