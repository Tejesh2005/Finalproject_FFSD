const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Admin homepage route - enforces admin authentication
router.get('/admin', async (req, res) => {
  // Check if user is logged in and is an admin
  if (!req.session.userId || req.session.userType !== 'admin') {
    return res.redirect('/login');
  }
  
  try {
    // Fetch user data to pass to the view
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.redirect('/login');
    }
    
    // Render admin dashboard with user data
    res.render('admin_dashboard/admin.ejs', { user });
  } catch (err) {
    console.error('Error accessing admin dashboard:', err);
    res.render('admin_dashboard/admin.ejs', { 
      user: {},
      error: 'Failed to load admin data'
    });
  }
});

module.exports = router;