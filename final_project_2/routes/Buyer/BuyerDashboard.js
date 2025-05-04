const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');

// Middleware to check if user is logged in
const isBuyerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'buyer') {
    return res.redirect('/login');
  }
  next();
};

// Main dashboard route
router.get('/buyer_dashboard', isBuyerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const page = req.query.page || 'dashboard';

    // Dashboard home with featured listings
    if (page === 'dashboard') {
      const featuredRentals = await RentalRequest.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('sellerId', 'firstName lastName')
        .exec();

      return res.render('buyer_dashboard/proj.ejs', {
        featuredRentals,
        user,
        error: null,
        success: null
      });
    }

    // All rentals page with search/filter
    if (page === 'rentals') {
      const { search, fuelType, transmission, minPrice, maxPrice } = req.query;
      const query = { status: 'available' };

      if (search) {
        query.vehicleName = { $regex: search, $options: 'i' };
      }

      if (fuelType) {
        query.fuelType = fuelType;
      }

      if (transmission) {
        query.transmission = transmission;
      }

      if (minPrice || maxPrice) {
        query.costPerKm = {};
        if (minPrice) query.costPerKm.$gte = parseFloat(minPrice);
        if (maxPrice) query.costPerKm.$lte = parseFloat(maxPrice);
      }

      const rentals = await RentalRequest.find(query)
        .populate('sellerId', 'firstName lastName email phone')
        .exec();

      return res.render('buyer_dashboard/rentals.ejs', {
        rentals,
        user,
        searchQuery: search,
        fuelType,
        transmission,
        minPrice,
        maxPrice
      });
    }

    // Single rental view
    if (page === 'rental' && req.query.id) {
      const rental = await RentalRequest.findById(req.query.id)
        .populate('sellerId', 'firstName lastName email phone')
        .exec();

      if (!rental) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Rental not found'
        });
      }

      return res.render('buyer_dashboard/rental.ejs', {
        ...rental.toObject(),
        user
      });
    }

    // All other pages (auctions, drivers, etc.)
    const validPages = [
      'auctions', 'auction', 
      'drivers', 'driver',
      'profile', 'wishlist',
      'purchase', 'purchase_details',
      'about'
    ];

    if (validPages.includes(page)) {
      // Handle auction details if needed
      if (page === 'auction' && req.query.id) {
        // Your existing auction logic
      }

      // Handle driver details if needed
      if (page === 'driver' && req.query.id) {
        // Your existing driver logic
      }

      return res.render(`buyer_dashboard/${page}.ejs`, { user });
    }

    // Invalid page requested
    return res.status(404).render('buyer_dashboard/error.ejs', {
      user,
      message: 'Page not found'
    });

  } catch (err) {
    console.error('Error in buyer_dashboard route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: {},
      message: 'An error occurred while loading the page'
    });
  }
});

// Profile route
router.get('/profile', isBuyerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.render('buyer_dashboard/profile.ejs', { user });
  } catch (err) {
    console.error(err);
    res.render('buyer_dashboard/profile.ejs', { 
      error: 'Failed to load user data', 
      user: {} 
    });
  }
});

// Update profile route
router.post('/update-profile', isBuyerLoggedIn, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;
    
    // Validate email if changed
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.session.userId } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }
    
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      address: {
        doorNo,
        street,
        city,
        state
      }
    };
    
    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update session
    req.session.userName = `${user.firstName} ${user.lastName}`;
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while updating profile' 
    });
  }
});

// Change password route
router.post('/change-password', isBuyerLoggedIn, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New passwords do not match' 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while changing password' 
    });
  }
});

// Update preferences route
router.post('/update-preferences', isBuyerLoggedIn, async (req, res) => {
  try {
    const { notificationPreference } = req.body;
    
    if (!['all', 'important', 'none'].includes(notificationPreference)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid preference' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: { notificationPreference } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Preferences updated successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while updating preferences' 
    });
  }
});

module.exports = router;