const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Wishlist = require('../../models/Wishlist');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest'); // Import AuctionRequest model

// Middleware to check if user is logged in
const isBuyerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'buyer') {
    return res.redirect('/login');
  }
  next();
};

// Wishlist view route
router.get('/wishlist', isBuyerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    // Get user's wishlist items
    const wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    // If no wishlist exists yet, create an empty one
    if (!wishlist) {
      return res.render('buyer_dashboard/wishlist', { 
        user,
        auctionWishlist: [],
        rentalWishlist: []
      });
    }
    
    // Get rental items details
    const rentalWishlist = await RentalRequest.find({
      _id: { $in: wishlist.rentals || [] }
    }).populate('sellerId', 'firstName lastName');
    
    // Get auction items details - using the actual AuctionRequest model
    const auctionWishlist = await AuctionRequest.find({
      _id: { $in: wishlist.auctions || [] },
      status: 'approved',
      started_auction: 'yes'
    }).populate('sellerId', 'firstName lastName');
    
    res.render('buyer_dashboard/wishlist', { 
      user, 
      auctionWishlist,
      rentalWishlist
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).render('buyer_dashboard/error', {
      user: {},
      message: 'Failed to load wishlist data'
    });
  }
});

// API to get wishlist items
router.get('/api/wishlist', isBuyerLoggedIn, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      return res.json({
        success: true,
        wishlist: { auctions: [], rentals: [] }
      });
    }
    
    res.json({
      success: true,
      wishlist: {
        auctions: wishlist.auctions || [],
        rentals: wishlist.rentals || []
      }
    });
  } catch (err) {
    console.error('Error fetching wishlist data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
});

// API to add to wishlist
router.post('/api/wishlist', isBuyerLoggedIn, async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;
    
    // Validate input
    if (!rentalId && !auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing item ID'
      });
    }
    
    // Get user's wishlist or create if it doesn't exist
    let wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.session.userId,
        auctions: [],
        rentals: []
      });
    }
    
    // Add item to appropriate wishlist
    if (rentalId) {
      // Check if rental exists
      const rental = await RentalRequest.findById(rentalId);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Add rental to wishlist if not already there
      if (!wishlist.rentals.includes(rentalId)) {
        wishlist.rentals.push(rentalId);
      }
    }
    
    if (auctionId) {
      // Check if auction exists
      const auction = await AuctionRequest.findById(auctionId);
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }
      
      // Add auction to wishlist if not already there
      if (!wishlist.auctions.includes(auctionId)) {
        wishlist.auctions.push(auctionId);
      }
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item added to wishlist'
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist'
    });
  }
});

// API to remove from wishlist
router.delete('/api/wishlist', isBuyerLoggedIn, async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;
    
    // Validate input
    if (!rentalId && !auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing item ID'
      });
    }
    
    // Get user's wishlist
    const wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Remove item from appropriate wishlist
    if (rentalId) {
      wishlist.rentals = wishlist.rentals.filter(id => id.toString() !== rentalId);
    }
    
    if (auctionId) {
      wishlist.auctions = wishlist.auctions.filter(id => id.toString() !== auctionId);
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

module.exports = router;