const express = require('express');
const router = express.Router();

// Wishlist route
router.get('/wishlist', (req, res) => {
  res.redirect('/buyer_dashboard?page=wishlist');
});

module.exports = router;