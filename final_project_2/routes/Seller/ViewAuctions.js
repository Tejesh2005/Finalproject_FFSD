const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');

// Middleware to check if user is logged in as seller
const isSellerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  next();
};

// Helper function to safely capitalize strings
const safeCapitalize = (str) => {
  if (!str || typeof str !== 'string') return 'Not specified';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'Not specified';
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return 'Invalid date';
  }
};

router.get('/view-auctions', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Fetch all auctions for this seller
    const auctions = await AuctionRequest.find({ sellerId: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.render('seller_dashboard/view-auctions.ejs', {
      user,
      auctions: auctions || [],
      helpers: {
        capitalize: safeCapitalize,
        formatDate
      },
      error: null
    });
  } catch (err) {
    console.error('Error fetching auction data:', err);
    res.render('seller_dashboard/view-auctions.ejs', {
      user: {},
      auctions: [],
      helpers: {
        capitalize: safeCapitalize,
        formatDate
      },
      error: 'Failed to load auction data'
    });
  }
});

module.exports = router;