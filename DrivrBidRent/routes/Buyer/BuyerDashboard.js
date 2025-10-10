// routes/Buyer/BuyerDashboard.js
const express = require('express');
const router = express.Router();
const { getDashboardHome } = require('../../controllers/buyerControllers/dashboardController');
const { getAuctions, getSingleAuction } = require('../../controllers/buyerControllers/auctionsController');
const { getRentals, getSingleRental } = require('../../controllers/buyerControllers/rentalsController');
const { getWishlist } = require('../../controllers/buyerControllers/wishlistController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Main dashboard route handler
router.get('/buyer_dashboard', isBuyerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 'dashboard';

    if (page === 'dashboard') {
      return getDashboardHome(req, res);
    }

    if (page === 'auctions') {
      return getAuctions(req, res);
    }

    if (page === 'rentals') {
      return getRentals(req, res);
    }

    if (page === 'wishlist') {
      return getWishlist(req, res);
    }

    if (page === 'rental' && req.query.id) {
      return getSingleRental(req, res);
    }

    if (page === 'auction' && req.query.id) {
      return getSingleAuction(req, res);
    }

    // Default fallback
    return getDashboardHome(req, res);
  } catch (err) {
    console.error('Error in buyer_dashboard route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading the dashboard'
    });
  }
});

module.exports = router;