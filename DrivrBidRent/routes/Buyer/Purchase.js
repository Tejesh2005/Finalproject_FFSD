// routes/Buyer/Purchase.js
const express = require('express');
const router = express.Router();
const { 
  getPurchase, 
  getAuctionPurchaseDetails, 
  getRentalDetails 
} = require('../../controllers/buyerControllers/purchaseController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Purchase page route - display user's rentals and auction purchases
router.get('/purchase', isBuyerLoggedin, getPurchase);

// Purchase details route for auction purchases
router.get('/purchase_details', isBuyerLoggedin, getAuctionPurchaseDetails);

// Rental details route - show complete details for a specific rental
router.get('/rental_details/:id', isBuyerLoggedin, getRentalDetails);

module.exports = router;