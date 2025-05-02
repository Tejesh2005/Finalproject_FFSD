const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model


router.get('/seller_dashboard/seller', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'seller') {
      return res.redirect('/login');
    }
    
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.redirect('/login');
      }
      res.render('seller_dashboard/seller.ejs', { user });
    } catch (err) {
      console.error(err);
      res.render('seller_dashboard/seller.ejs', { user: {} });
    }
  });

  module.exports = router;