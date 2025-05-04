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

// GET: Show update rental form
router.get('/update-rental/:id', isSellerLoggedIn, async (req, res) => {
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
    
    res.render('seller_dashboard/update-rental', {
      user,
      rental,
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/update-rental', {
      user: {},
      rental: null,
      error: 'Failed to load rental data',
      success: null
    });
  }
});

// POST: Handle rental update
router.post('/update-rental/:id', isSellerLoggedIn, async (req, res) => {
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
    
    // Update fields
    rental.costPerKm = parseFloat(req.body['rental-cost']);
    rental.driverAvailable = req.body['driver-available'] === 'yes';
    rental.status = req.body['status'];
    
    if (rental.driverAvailable) {
      rental.driverRate = parseFloat(req.body['driver-rate']);
    } else {
      rental.driverRate = undefined;
    }
    
    await rental.save();
    
    res.render('seller_dashboard/update-rental', {
      user,
      rental,
      success: 'Rental updated successfully!',
      error: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/update-rental', {
      user: {},
      rental: null,
      error: 'Failed to update rental',
      success: null
    });
  }
});

module.exports = router;