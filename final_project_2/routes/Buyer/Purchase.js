const express = require('express');
const router = express.Router();

// Purchase page route
router.get('/purchase', (req, res) => {
  res.redirect('/buyer_dashboard?page=purchase');
});

// Purchase details route
router.get('/purchase_details', (req, res) => {
  res.redirect('/buyer_dashboard?page=purchase_details');
});

module.exports = router;