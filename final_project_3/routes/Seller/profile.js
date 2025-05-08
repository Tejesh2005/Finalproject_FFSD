const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model

router.get('/profile', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // In a real app, you would fetch these from your database
    // For now, we'll use placeholder data
    const auctionsCount = 5; // Replace with actual query
    const rentalsCount = 4;  // Replace with actual query
    const totalEarnings = 150000; // Replace with actual query
    
    // Recent transactions placeholder
    const recentTransactions = [
      { amount: 50000, description: 'Honda Civic (Auction)' },
      { amount: 30000, description: 'Toyota Innova (Rental)' },
      { amount: 20000, description: 'Kia Sonet (Auction)' }
    ];
    
    res.render('seller_dashboard/profile.ejs', { 
      user,
      auctionsCount,
      rentalsCount,
      totalEarnings,
      recentTransactions
    });
  } catch (err) {
    console.error(err);
    res.render('seller_dashboard/profile.ejs', { 
      user: {}, 
      error: 'Failed to load user data',
      auctionsCount: 0,
      rentalsCount: 0,
      totalEarnings: 0,
      recentTransactions: []
    });
  }
});

// Route to update seller profile information
router.post('/update-profile', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Validate phone number
    if (!phone.match(/^\d{10}$/)) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Update user data
    const updatedData = {
      firstName,
      lastName,
      email,
      phone,
      doorNo: doorNo || '',
      street: street || '',
      city: city || '',
      state: state || ''
    };

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updatedData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating your profile' });
  }
});

// Route to update preferences
router.post('/update-preferences', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { notificationPreference } = req.body;

    // Validate notification preference
    const validPreferences = ['all', 'important', 'none'];
    if (!notificationPreference || !validPreferences.includes(notificationPreference)) {
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
    console.error('Error updating preferences:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating preferences' });
  }
});

// Route to change password
router.post('/change-password', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ success: false, message: 'An error occurred while changing your password' });
  }
});

module.exports = router;