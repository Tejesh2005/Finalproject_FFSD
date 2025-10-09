const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const isBuyerLoggedin=require('../../middlewares/isBuyerLoggedin');


router.get('/Aboutus', (req, res) => {
  res.render('./buyer_dashboard/Aboutus');
});

module.exports = router;