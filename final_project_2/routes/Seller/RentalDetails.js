const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');

// Middleware to check seller login
const isSellerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  next();
};

// GET: Show rental details page
router.get('/rental-details/:id', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.session.userId
    });
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    res.render('seller_dashboard/rental-details', { 
      user,
      rental,
      error: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/rental-details', { 
      user: {},
      rental: null,
      error: 'Failed to load rental details' 
    });
  }
});

module.exports = router;