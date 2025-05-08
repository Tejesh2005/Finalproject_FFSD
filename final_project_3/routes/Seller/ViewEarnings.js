const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');

// Middleware to check seller login
const isSellerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  next();
};

// GET: Show earnings page
router.get('/view-earnings', isSellerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    // Fetch all RentalCost entries for the seller
    const rentalCosts = await RentalCost.find({ sellerId: req.session.userId })
      .populate({
        path: 'rentalCarId',
        select: 'vehicleName'
      })
      .sort({ createdAt: -1 }) // Sort by most recent
      .lean();

    // Calculate total earnings from rentals
    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    // Format recent earnings for display
    const recentEarnings = rentalCosts.slice(0, 5).map(cost => ({
      amount: cost.totalCost,
      description: `${cost.rentalCarId ? cost.rentalCarId.vehicleName : 'Unknown Vehicle'} (Rental)`
    }));

    // Placeholder for auction earnings (since Auction model is not implemented)
    const totalAuctionEarnings = 0; // Replace with actual data when Auction model is available
    const auctionEarnings = []; // Placeholder for recent auction earnings

    // Combine recent earnings (rentals + auctions)
    const allRecentEarnings = [...recentEarnings, ...auctionEarnings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    res.render('seller_dashboard/view-earnings.ejs', {
      user,
      totalRentalEarnings,
      totalAuctionEarnings,
      recentEarnings: allRecentEarnings,
      error: null
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.render('seller_dashboard/view-earnings.ejs', {
      user: {},
      totalRentalEarnings: 0,
      totalAuctionEarnings: 0,
      recentEarnings: [],
      error: 'Failed to load earnings data'
    });
  }
});

module.exports = router;