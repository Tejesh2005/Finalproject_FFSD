const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model

router.get('/view-earnings', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // In a real app, you would fetch earnings data from a database
    // For now, we'll just render the template
    
    res.render('seller_dashboard/view-earnings.ejs', { user });
  } catch (err) {
    console.error(err);
    res.render('seller_dashboard/view-earnings.ejs', { user: {}, error: 'Failed to load data' });
  }
});

module.exports = router;