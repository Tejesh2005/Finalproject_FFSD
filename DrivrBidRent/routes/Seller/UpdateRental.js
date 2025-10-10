const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show update rental form
router.get('/update-rental/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    // Check if current date is before return date
    const currentDate = new Date();
    const isBeforeReturnDate = rental.dropDate && currentDate < new Date(rental.dropDate);
    
    res.render('seller_dashboard/update-rental', {
      user,
      rental,
      error: null,
      success: null,
      isBeforeReturnDate
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/update-rental', {
      user: {},
      rental: null,
      error: 'Failed to load rental data',
      success: null,
      isBeforeReturnDate: false
    });
  }
});

// POST: Handle rental update
router.post('/update-rental/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found. Please log in again.'
      });
    }
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!rental) {
      return res.status(404).json({ 
        success: false,
        message: 'Rental not found.'
      });
    }
    
    // Check if current date is before return date
    const currentDate = new Date();
    const isBeforeReturnDate = rental.dropDate && currentDate < new Date(rental.dropDate);
    
    // If changing from unavailable to available when before return date, show error
    if (rental.status === 'unavailable' && req.body['status'] === 'available' && isBeforeReturnDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change status from unavailable to available before the return date'
      });
    }
    
    // Validate required fields
    const requiredFields = ['rental-cost', 'driver-available', 'status'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate cost
    const cost = parseFloat(req.body['rental-cost']);
    if (isNaN(cost) || cost <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cost per day must be a positive number.'
      });
    }
    
    // Add additional validation for driver rate if driver is available
    if (req.body['driver-available'] === 'yes' && (!req.body['driver-rate'] || isNaN(parseFloat(req.body['driver-rate'])))) {
      return res.status(400).json({ 
        success: false,
        message: 'Driver rate is required and must be a positive number when driver is available'
      });
    }
    
    // Update fields
    rental.costPerDay = cost;
    rental.driverAvailable = req.body['driver-available'] === 'yes';
    rental.status = req.body['status'];
    
    if (rental.driverAvailable) {
      rental.driverRate = parseFloat(req.body['driver-rate']);
    } else {
      rental.driverRate = undefined;
    }
    
    await rental.save();
    
    res.json({
      success: true,
      message: 'Rental updated successfully!',
      redirect: `/seller_dashboard/rental-details/${req.params.id}`
    });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update rental: ' + err.message
    });
  }
});

module.exports = router;