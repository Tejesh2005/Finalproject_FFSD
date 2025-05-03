const express = require('express');
const router = express.Router();

// Rental details route
router.get('/rental', (req, res) => {
  const id = req.query.id;
  res.redirect(`/buyer_dashboard?page=rental&id=${id}`);
});

// Rentals list route
router.get('/rentals', (req, res) => {
  res.redirect('/buyer_dashboard?page=rentals');
});

module.exports = router;