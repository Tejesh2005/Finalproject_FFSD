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

router.get('/view-rentals', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    // Fetch rentals for this seller from the database
    const rentals = await RentalRequest.find({ sellerId: req.session.userId });
    
    // Process rentals to include the seller's city as location
    const processedRentals = rentals.map(rental => {
      return {
        ...rental._doc,
        location: user.city || 'City not specified'
      };
    });
    
    res.render('seller_dashboard/view-rentals', { 
      user,
      rentals: processedRentals,
      error: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/view-rentals', { 
      user: {},
      rentals: [],
      error: 'Failed to load rental listings' 
    });
  }
});

// Toggle rental availability
router.post('/toggle-rental-status/:id', isSellerLoggedIn, async (req, res) => {
  try {
    const rentalId = req.params.id;
    const rental = await RentalRequest.findById(rentalId);
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    // Check if the rental belongs to the logged-in seller
    if (rental.sellerId.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Toggle the status
    rental.status = rental.status === 'available' ? 'unavailable' : 'available';
    await rental.save();
    
    return res.json({ success: true, newStatus: rental.status });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;