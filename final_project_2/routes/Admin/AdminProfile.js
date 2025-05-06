const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Import User model
const bcrypt = require('bcrypt');

// Route to render admin profile page
router.get('/admin-profile', async (req, res) => {
  try {
    // Fetch admin user from database (assuming admin's ID is stored in session)
    const adminUser = await User.findOne({ userType: 'admin' });
    
    if (!adminUser) {
      return res.status(404).send('Admin user not found');
    }
    
    res.render('admin_dashboard/admin-profile.ejs', { admin: adminUser });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).send('Server error');
  }
});

// Route to update admin password
router.post('/update-admin-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Get admin user (assuming admin's ID is stored in session)
    const adminUser = await User.findOne({ userType: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    
    // Verify current password
    const isMatch = await adminUser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    // Update password
    adminUser.password = newPassword;
    await adminUser.save();
    
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating admin password:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;