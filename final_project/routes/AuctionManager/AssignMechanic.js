const express = require('express');
const router = express.Router();


router.get('/assign-mechanic',(req,res) => {
    res.render('auctionmanager/assign-mechanic.ejs')
  })

  module.exports = router;
  