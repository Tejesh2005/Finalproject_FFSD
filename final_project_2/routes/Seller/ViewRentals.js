const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model


router.get('/seller_dashboard/view-rentals', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // In a real app, you would fetch rentals from a database
    // For now, we'll just render the template
    
    res.render('seller_dashboard/view-rentals.ejs', { user });
  } catch (err) {
    console.error(err);
    res.render('seller_dashboard/view-rentals.ejs', { user: {}, error: 'Failed to load data' });
  }
});

module.exports = router;
