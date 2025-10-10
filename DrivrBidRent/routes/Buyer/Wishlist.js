// routes/Buyer/Wishlist.js
const express = require('express');
const router = express.Router();
const { 
  getWishlist, 
  getWishlistApi, 
  addToWishlistApi, 
  removeFromWishlistApi 
} = require('../../controllers/buyerControllers/wishlistController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Wishlist view route
router.get('/wishlist', isBuyerLoggedin, getWishlist);

// API to get wishlist items
router.get('/api/wishlist', isBuyerLoggedin, getWishlistApi);

// API to add to wishlist
router.post('/api/wishlist', isBuyerLoggedin, addToWishlistApi);

// API to remove from wishlist
router.delete('/api/wishlist', isBuyerLoggedin, removeFromWishlistApi);

module.exports = router;