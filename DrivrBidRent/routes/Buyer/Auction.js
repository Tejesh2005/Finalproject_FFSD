// routes/Buyer/Auction.js
const express = require('express');
const router = express.Router();
const { 
  placeBid, 
  getAuctionWinnerStatus, 
  getAuctionConfirmPayment, 
  completeAuctionPayment 
} = require('../../controllers/buyerControllers/auctionsController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Route to handle bid placement
router.post('/auction/place-bid', isBuyerLoggedin, placeBid);

// Check if user is the auction winner and get payment status
router.get('/auction/winner-status/:id', isBuyerLoggedin, getAuctionWinnerStatus);

// Route to fetch payment details for the popup
router.get('/auction/confirm-payment/:id', isBuyerLoggedin, getAuctionConfirmPayment);

// Route to handle final payment submission
router.post('/auction/complete-payment/:id', isBuyerLoggedin, completeAuctionPayment);

module.exports = router;