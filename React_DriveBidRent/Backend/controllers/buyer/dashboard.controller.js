// controllers/buyer/dashboard.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';

// Controller for dashboard home with featured listings
export const getDashboardHome = async (req, res) => {
  try {
    const featuredRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const featuredAuctions = await AuctionRequest.find({
      status: 'approved',
      started_auction: 'yes'
    })
      .sort({ auctionDate: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: { featuredRentals, featuredAuctions, user: req.user }
    });

    // res.render('buyer_dashboard/proj.ejs', {
    //   featuredRentals,
    //   featuredAuctions,
    //   user: req.user,
    //   error: null,
    //   success: null
    // });
  } catch (err) {
    console.error('Error fetching dashboard home:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the dashboard',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   user: req.user || {},
    //   message: 'An error occurred while loading the dashboard'
    // });
  }
};