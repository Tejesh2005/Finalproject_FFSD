const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Auction details route
router.get('/auction', (req, res) => {
  const id = req.query.id;
  res.redirect(`/buyer_dashboard?page=auction&id=${id}`);
});

// Auctions list route
router.get('/auctions', (req, res) => {
  res.redirect('/buyer_dashboard?page=auctions');
});

module.exports = router;