const express = require('express');
const router = express.Router();
const User = require('../../models/User');


router.get('/Aboutus', (req, res) => {
  res.redirect('/buyer_dashboard?page=about');
});

module.exports = router;