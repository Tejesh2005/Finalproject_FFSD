const express = require('express');
const router = express.Router();


router.get('/pending',(req,res)=>{
    res.render('auctionmanager/pending.ejs')
  })
module.exports = router;
