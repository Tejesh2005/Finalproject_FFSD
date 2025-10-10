// routes/Buyer/Rental.js
const express = require('express');
const router = express.Router();
const { bookRental } = require('../../controllers/buyerControllers/rentalsController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Rental details route
router.get('/rental', isBuyerLoggedin, (req, res) => {
  const id = req.query.id;
  console.log('GET /rental - Redirecting to buyer_dashboard with id:', id);
  res.redirect(`/buyer_dashboard?page=rental&id=${id}`);
});

// Rentals list route
router.get('/rentals', isBuyerLoggedin, (req, res) => {
  console.log('GET /rentals - Redirecting to buyer_dashboard rentals page');
  res.redirect('/buyer_dashboard?page=rentals');
});

// Save rental dates in RentalRequest and cost in RentalCost
router.post('/rental', isBuyerLoggedin, bookRental);

module.exports = router;