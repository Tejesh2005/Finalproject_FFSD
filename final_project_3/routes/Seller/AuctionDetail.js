const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest'); // Adjust path as needed
const User = require('../../models/User'); // Make sure you have a User model

// Define the isSellerLoggedIn middleware
const isSellerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  next();
};

// Route to display auction details
router.get('/auction-details/:id', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Fetch specific auction by ID
    const auction = await AuctionRequest.findOne({
      _id: req.params.id,
      sellerId: req.session.userId
    }).lean();
    
    if (!auction) {
      return res.redirect('/seller_dashboard/view-auctions');
    }
    
    res.render('seller_dashboard/auction-details.ejs', {
      user,
      auction,
      helpers: {
        capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
        formatDate: (date) => date ? new Date(date).toLocaleDateString() : 'Not specified'
      },
      error: null
    });
  } catch (err) {
    console.error('Error fetching auction details:', err);
    res.redirect('/seller_dashboard/view-auctions');
  }
});

module.exports = router;