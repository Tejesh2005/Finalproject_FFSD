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

// GET: Show add rental page
router.get('/add-rental', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.render('seller_dashboard/add-rental', {
      user,
      formData: {},
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/add-rental', {
      user: {},
      error: 'Failed to load page',
      formData: {},
      success: null
    });
  }
});

// POST: Handle rental submission
router.post('/add-rental', isSellerLoggedIn, async (req, res) => {
  console.log('Request Body:', req.body); // Debug log
  
  try {
    // Validate required fields
    const requiredFields = [
      'vehicle-name', 
      'vehicle-image',
      'vehicle-year',
      'vehicle-mileage',
      'vehicle-condition',
      'rental-cost',
      'driver-available'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.render('seller_dashboard/add-rental', {
        user: { _id: req.session.userId },
        formData: req.body,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        success: null
      });
    }

    // Create new rental
    const newRental = new RentalRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: req.body['vehicle-image'],
      year: parseInt(req.body['vehicle-year']),
      mileage: parseInt(req.body['vehicle-mileage']),
      condition: req.body['vehicle-condition'],
      costPerKm: parseFloat(req.body['rental-cost']),
      driverAvailable: req.body['driver-available'] === 'yes',
      sellerId: req.session.userId,
      status: 'available'
    });

    // Save to database
    const savedRental = await newRental.save();
    console.log('Saved Rental:', savedRental); // Debug log

    // Return success message
    return res.render('seller_dashboard/add-rental', {
      user: { _id: req.session.userId },
      formData: {},
      success: 'Rental added successfully!',
      error: null
    });

  } catch (err) {
    console.error('Save Error:', err);
    return res.status(500).render('seller_dashboard/add-rental', {
      user: { _id: req.session.userId },
      formData: req.body,
      error: 'Error saving rental: ' + err.message,
      success: null
    });
  }
});

module.exports = router;