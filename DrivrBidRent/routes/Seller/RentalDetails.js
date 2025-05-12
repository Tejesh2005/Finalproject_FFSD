const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const RentalCost = require('../../models/RentalCost');

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
    })
    .populate('buyerId', 'firstName lastName email phone'); // Populate buyerId with specific fields
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    // Fetch the rental cost to get the total money received
    const rentalCost = await RentalCost.findOne({ rentalCarId: rental._id });
    const moneyReceived = rentalCost ? rentalCost.totalCost : null;

    // Format dates for display
    const formattedPickupDate = rental.pickupDate ? rental.pickupDate.toISOString().split('T')[0] : 'Not specified';
    const formattedDropDate = rental.dropDate ? rental.dropDate.toISOString().split('T')[0] : 'Not specified';

    res.render('seller_dashboard/rental-details', { 
      user,
      rental,
      formattedPickupDate,
      formattedDropDate,
      moneyReceived,
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