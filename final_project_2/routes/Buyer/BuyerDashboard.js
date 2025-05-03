const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Main dashboard route
router.get('/buyer_dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Get the page parameter or default to dashboard
    const page = req.query.page || 'dashboard';
    
    // Determine which template to render based on the page parameter
    let template;
    switch (page) {
      case 'dashboard':
        template = 'buyer_dashboard/proj.ejs';
        break;
      case 'about':
        template = 'buyer_dashboard/Aboutus.ejs';
        break;
      case 'auction':
        template = 'buyer_dashboard/auction.ejs';
        // Get car details if an id is provided
        if (req.query.id) {
          const cars = require('../../cardetails');
          const selectedCar = cars.find(car => car.id === parseInt(req.query.id));
          if (!selectedCar) {
            return res.status(404).send("Car not found");
          }
          return res.render(template, { ...selectedCar, user });
        }
        break;
      case 'auctions':
        template = 'buyer_dashboard/auctions.ejs';
        break;
      case 'driver':
        template = 'buyer_dashboard/driver.ejs';
        // Get driver details if an id is provided
        if (req.query.id) {
          const drivers = require('../../driverdetails');
          const selectedDriver = drivers.find(driver => driver.id === parseInt(req.query.id));
          if (!selectedDriver) {
            return res.status(404).send("Driver not found");
          }
          return res.render(template, { ...selectedDriver, user });
        }
        break;
      case 'drivers':
        template = 'buyer_dashboard/drivers.ejs';
        break;
      case 'rental':
        template = 'buyer_dashboard/rental.ejs';
        // Get rental details if an id is provided
        if (req.query.id) {
          const rentals = require('../../rentaldetails');
          const selectedRental = rentals.find(rental => rental.id === parseInt(req.query.id));
          if (!selectedRental) {
            return res.status(404).send("Rental not found");
          }
          return res.render(template, { ...selectedRental, user });
        }
        break;
      case 'rentals':
        template = 'buyer_dashboard/rentals.ejs';
        break;
      case 'purchase':
        template = 'buyer_dashboard/purchase.ejs';
        break;
      case 'purchase_details':
        template = 'buyer_dashboard/purchase_details.ejs';
        break;
      case 'wishlist':
        template = 'buyer_dashboard/wishlist.ejs';
        break;
      default:
        template = 'buyer_dashboard/proj.ejs';
    }
    
    console.log(`Rendering template: ${template} for page: ${page}`);
    res.render(template, { user });
  } catch (err) {
    console.error('Error in buyer_dashboard route:', err);
    res.render('buyer_dashboard/proj.ejs', { user: {}, error: 'Failed to load data' });
  }
});

// Profile route
router.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    res.render('buyer_dashboard/profile.ejs', { user });
  } catch (err) {
    console.error(err);
    res.render('buyer_dashboard/profile.ejs', { error: 'Failed to load user data', user: {} });
  }
});

// Update profile route
router.post('/update-profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;
    
    // Check if email is already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account' });
      }
    }
    
    const updateData = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      doorNo: doorNo || undefined,
      street: street || undefined,
      city: city || undefined,
      state: state || undefined
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updateData },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update session data if name changed
    if (firstName || lastName) {
      req.session.userName = `${user.firstName} ${user.lastName}`;
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }
    
    // Find user
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while changing password' });
  }
});

// Update preferences route
router.post('/update-preferences', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const { notificationPreference } = req.body;
    
    // Validate input
    if (!['all', 'important', 'none'].includes(notificationPreference)) {
      return res.status(400).json({ success: false, message: 'Invalid notification preference' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: { notificationPreference } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating preferences' });
  }
});

module.exports = router;