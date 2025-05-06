const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const RentalCost = require('../../models/RentalCost');

// Middleware to check admin login
const isAdminLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'admin') {
    return res.redirect('/login');
  }
  next();
};

// GET: Show analytics page
router.get('/analytics', isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch total cars rented (unavailable rentals)
    const totalCarsRented = await RentalRequest.countDocuments({ status: 'unavailable' });

    // Fetch total auction listings
    const totalAuctionListings = await AuctionRequest.countDocuments();

    // Aggregate vehicle sales performance for rentals
    const rentalPerformance = await RentalCost.aggregate([
      {
        $lookup: {
          from: 'rentalrequests',
          localField: 'rentalCarId',
          foreignField: '_id',
          as: 'rental'
        }
      },
      { $unwind: '$rental' },
      {
        $group: {
          _id: '$rental.vehicleName',
          unitsSold: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' }
        }
      },
      {
        $project: {
          vehicleName: '$_id',
          unitsSold: 1,
          totalRevenue: 1,
          avgSalePrice: { $divide: ['$totalRevenue', '$unitsSold'] },
          _id: 0
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Aggregate vehicle sales performance for auctions
    // Note: AuctionRequest does not have a final sale price field, so we'll use startingBid as a placeholder
    const auctionPerformance = await AuctionRequest.aggregate([
      {
        $match: { status: 'approved' } // Assuming 'approved' means the auction was completed
      },
      {
        $group: {
          _id: '$vehicleName',
          unitsSold: { $sum: 1 },
          totalRevenue: { $sum: '$startingBid' } // Placeholder: Replace with actual sale price when available
        }
      },
      {
        $project: {
          vehicleName: '$_id',
          unitsSold: 1,
          totalRevenue: 1,
          avgSalePrice: { $divide: ['$totalRevenue', '$unitsSold'] },
          _id: 0
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Combine rental and auction performance
    const vehiclePerformance = [...rentalPerformance, ...auctionPerformance]
      .reduce((acc, curr) => {
        const existing = acc.find(item => item.vehicleName === curr.vehicleName);
        if (existing) {
          existing.unitsSold += curr.unitsSold;
          existing.totalRevenue += curr.totalRevenue;
          existing.avgSalePrice = existing.totalRevenue / existing.unitsSold;
        } else {
          acc.push(curr);
        }
        return acc;
      }, [])
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    res.render('admin_dashboard/analytics.ejs', {
      totalUsers,
      totalCarsRented,
      totalAuctionListings,
      vehiclePerformance,
      error: null
    });
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).render('admin_dashboard/analytics.ejs', {
      totalUsers: 0,
      totalCarsRented: 0,
      totalAuctionListings: 0,
      vehiclePerformance: [],
      error: 'Failed to load analytics data'
    });
  }
});

module.exports = router;