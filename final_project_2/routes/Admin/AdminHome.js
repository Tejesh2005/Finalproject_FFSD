const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');

// Middleware to check admin login
const isAdminLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'admin') {
    return res.redirect('/login');
  }
  next();
};

// Admin homepage route
router.get('/admin', isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch total earnings from rentals
    const rentalCosts = await RentalCost.find()
      .populate('sellerId', 'firstName lastName')
      .populate('rentalCarId', 'vehicleName')
      .lean();

    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    // Fetch total earnings from auctions (using startingBid as placeholder)
    const auctions = await AuctionRequest.find({ status: 'approved' })
      .populate('sellerId', 'firstName lastName')
      .lean();

    const totalAuctionEarnings = auctions.reduce((sum, auction) => sum + (auction.startingBid || 0), 0);

    // Calculate total earnings
    const totalEarnings = totalRentalEarnings + totalAuctionEarnings;

    // Format recent activity (limit to 5)
    const rentalActivities = rentalCosts.slice(0, 5).map(cost => ({
      description: `New earning: ₹${cost.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} from rental by ${cost.sellerId ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}` : 'Unknown'} (${cost.rentalCarId ? cost.rentalCarId.vehicleName : 'Unknown Vehicle'})`,
      timestamp: cost.createdAt
    }));

    const auctionActivities = auctions.slice(0, 5).map(auction => ({
      description: `New earning: ₹${auction.startingBid.toLocaleString('en-IN', { minimumFractionDigits: 2 })} from auction by ${auction.sellerId ? `${auction.sellerId.firstName} ${auction.sellerId.lastName}` : 'Unknown'} (${auction.vehicleName})`,
      timestamp: auction.createdAt
    }));

    // Fetch recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt')
      .lean();

    const userActivities = recentUsers.map(user => ({
      description: `New user registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt
    }));

    // Combine and sort activities by timestamp (most recent first)
    const recentActivity = [...userActivities, ...rentalActivities, ...auctionActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.render('admin_dashboard/admin.ejs', {
      user,
      totalUsers,
      totalEarnings,
      recentActivity,
      error: null
    });
  } catch (err) {
    console.error('Error accessing admin dashboard:', err);
    res.render('admin_dashboard/admin.ejs', {
      user: {},
      totalUsers: 0,
      totalEarnings: 0,
      recentActivity: [],
      error: 'Failed to load admin data'
    });
  }
});

module.exports = router;