const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model

router.get('/profile',async (req, res) => {
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

module.exports = router;