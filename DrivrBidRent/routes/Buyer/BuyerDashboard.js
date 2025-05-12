const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const Wishlist = require('../../models/Wishlist');
const bcrypt = require('bcrypt');

// Middleware to check if user is logged in
const isBuyerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'buyer') {
    return res.redirect('/login');
  }
  next();
};

// Main dashboard route
router.get('/buyer_dashboard', isBuyerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const page = req.query.page || 'dashboard';

    // Dashboard home with featured listings
    if (page === 'dashboard') {
      // Fetch featured rentals
      const featuredRentals = await RentalRequest.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('sellerId', 'firstName lastName')
        .exec();

      // Fetch featured auctions - only approved and started auctions, not ended
      const featuredAuctions = await AuctionRequest.find({ 
        status: 'approved', 
        started_auction: 'yes'
      })
        .sort({ auctionDate: 1 }) // Sort by upcoming auction date
        .limit(3)
        .populate('sellerId', 'firstName lastName')
        .exec();

      return res.render('buyer_dashboard/proj.ejs', {
        featuredRentals,
        featuredAuctions,
        user,
        error: null,
        success: null
      });
    }

    // All auctions page with search/filter
    if (page === 'auctions') {
      const { search, condition, fuelType, transmission, minPrice, maxPrice } = req.query;
      const query = { 
        status: 'approved', 
        started_auction: 'yes'
      };

      if (search) {
        query.vehicleName = { $regex: search, $options: 'i' };
      }

      if (condition) {
        query.condition = condition;
      }

      if (fuelType) {
        query.fuelType = fuelType;
      }

      if (transmission) {
        query.transmission = transmission;
      }

      if (minPrice || maxPrice) {
        query.startingBid = {};
        if (minPrice) query.startingBid.$gte = parseFloat(minPrice);
        if (maxPrice) query.startingBid.$lte = parseFloat(maxPrice);
      }

      const auctions = await AuctionRequest.find(query)
        .sort({ auctionDate: 1 })
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      return res.render('buyer_dashboard/auctions.ejs', {
        auctions,
        user,
        search,
        condition,
        fuelType,
        transmission,
        minPrice,
        maxPrice
      });
    }

    // All rentals page with search/filter
    if (page === 'rentals') {
      const { search, fuelType, transmission, minPrice, maxPrice, capacity, city } = req.query;
      const query = { status: 'available' };

      if (search) {
        query.vehicleName = { $regex: search, $options: 'i' };
      }

      if (fuelType) {
        query.fuelType = fuelType;
      }

      if (transmission) {
        query.transmission = transmission;
      }

      if (minPrice || maxPrice) {
        query.costPerDay = {};
        if (minPrice) query.costPerDay.$gte = parseFloat(minPrice);
        if (maxPrice) query.costPerDay.$lte = parseFloat(maxPrice);
      }

      if (capacity) {
        query.capacity = { $gte: parseInt(capacity) };
      }

      let rentals = await RentalRequest.find(query)
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      // Filter by city if provided
      if (city) {
        rentals = rentals.filter(rental => rental.sellerId && rental.sellerId.city && rental.sellerId.city.toLowerCase() === city.toLowerCase());
      }

      // Fetch all unique cities for the dropdown (only from sellers who have rentals)
      const sellersWithRentals = await RentalRequest.find({ status: 'available' })
        .populate('sellerId', 'city')
        .exec();
      
      const uniqueCities = [...new Set(
        sellersWithRentals
          .filter(rental => rental.sellerId && rental.sellerId.city)
          .map(rental => rental.sellerId.city)
      )].sort();

      return res.render('buyer_dashboard/rentals.ejs', {
        rentals,
        user,
        searchQuery: search,
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        capacity,
        city,
        uniqueCities
      });
    }

    // Wishlist page
    if (page === 'wishlist') {
      try {
        // Get user's wishlist items
        let wishlist = await Wishlist.findOne({ userId: req.session.userId });
        
        // If no wishlist exists yet, create an empty one
        if (!wishlist) {
          wishlist = new Wishlist({
            userId: req.session.userId,
            auctions: [],
            rentals: []
          });
          await wishlist.save();
        }
        
        console.log("Wishlist found:", wishlist);
        console.log("Auction IDs in wishlist:", wishlist.auctions);
        console.log("Rental IDs in wishlist:", wishlist.rentals);
        
        // Get rental items details
        const rentalWishlist = await RentalRequest.find({
          _id: { $in: wishlist.rentals || [] }
        }).populate('sellerId', 'firstName lastName');
        
        // Get auction items details
        const auctionWishlist = await AuctionRequest.find({
          _id: { $in: wishlist.auctions || [] },
          started_auction: 'yes' // Include only active or stopped auctions
        }).populate('sellerId', 'firstName lastName');
        
        console.log("Found auction items:", auctionWishlist.length);
        console.log("Found rental items:", rentalWishlist.length);
        
        return res.render('buyer_dashboard/wishlist', { 
          user, 
          auctionWishlist,
          rentalWishlist
        });
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        return res.status(500).render('buyer_dashboard/error', {
          user,
          message: 'Failed to load wishlist data: ' + err.message
        });
      }
    }

    // Single rental view
    if (page === 'rental' && req.query.id) {
      const rental = await RentalRequest.findById(req.query.id)
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      if (!rental) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Rental not found'
        });
      }

      // Pass the rental data directly to the template, including the rentalId
      return res.render('buyer_dashboard/rental.ejs', {
        rentalId: rental._id,
        vehicleName: rental.vehicleName,
        vehicleImage: rental.vehicleImage,
        year: rental.year,
        condition: rental.condition,
        capacity: rental.capacity,
        fuelType: rental.fuelType,
        transmission: rental.transmission,
        AC: rental.AC,
        costPerDay: rental.costPerDay,
        driverAvailable: rental.driverAvailable,
        driverRate: rental.driverRate,
        seller: rental.sellerId,
        user
      });
    }

    // Single auction detail view
    if (page === 'auction_detail' && req.query.id) {
      const auction = await AuctionRequest.findOne({
        _id: req.query.id,
        started_auction: 'yes' // Include active or stopped auctions
      })
        .populate('sellerId', 'firstName lastName email phone city state')
        .populate('assignedMechanic', 'firstName lastName')
        .exec();

      if (!auction) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Auction not found or has ended'
        });
      }

      // Format mechanic name if available
      if (auction.assignedMechanic) {
        auction.mechanicName = `${auction.assignedMechanic.firstName} ${auction.assignedMechanic.lastName}`;
      }

      return res.render('buyer_dashboard/auction_detail.ejs', {
        auction,
        seller: auction.sellerId,
        user
      });
    }

    // Single auction view for bidding
    if (page === 'auction' && req.query.id) {
      const auction = await AuctionRequest.findOne({ 
        _id: req.query.id,
        started_auction: 'yes'
      })
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      if (!auction) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Auction not found or has ended'
        });
      }

      // Fetch current bid (most recent bid marked as current)
      const currentBid = await AuctionBid.findOne({ auctionId: req.query.id, isCurrentBid: true })
        .sort({ bidTime: -1 });

      // Check if the logged-in user is the current bidder
      const isCurrentBidder = currentBid && req.session.userId === currentBid.buyerId.toString();

      return res.render('buyer_dashboard/auction.ejs', {
        auction,
        currentBid,
        isLoggedIn: !!req.session.userId,
        isCurrentBidder,
        user
      });
    }

    const validPages = [
      'drivers', 'driver',
      'profile',
      'purchase', 'purchase_details',
      'about'
    ];

    if (validPages.includes(page)) {
      // Handle driver details if needed
      if (page === 'driver' && req.query.id) {
        // Your existing driver logic
      }
      
      if(page === 'about'){
        return res.render('buyer_dashboard/Aboutus.ejs', { user });
      }

      if(page === 'profile'){
        return res.render('buyer_dashboard/profile.ejs', { user });
      }

      return res.render(`buyer_dashboard/${page}.ejs`, { user });
    }

    // Invalid page requested
    return res.status(404).render('buyer_dashboard/error.ejs', {
      user,
      message: 'Page not found'
    });

  } catch (err) {
    console.error('Error in buyer_dashboard route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: {},
      message: 'An error occurred while loading the page'
    });
  }
});

// Direct route for profile page
router.get('/profile', isBuyerLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    return res.render('buyer_dashboard/profile.ejs', { user });
  } catch (err) {
    console.error('Error in profile route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.session.user || {},
      message: 'An error occurred while loading the profile page'
    });
  }
});

// Route to update profile
router.post('/update-profile', isBuyerLoggedIn, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;
    const userId = req.session.userId;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Validate phone if provided
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    // Update user
    const updateData = {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      doorNo: doorNo || '',
      street: street || '',
      city: city || '',
      state: state || ''
    };

    await User.findByIdAndUpdate(userId, updateData, { new: true });

    return res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the profile'
    });
  }
});

// Route to change password
router.post('/change-password', isBuyerLoggedIn, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword; // bcrypt hashing is handled by pre-save middleware
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while changing the password'
    });
  }
});

// Direct route for auction detail
router.get('/auction_detail', isBuyerLoggedIn, async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(404).render('buyer_dashboard/error.ejs', {
        user: req.session.user || {},
        message: 'Auction ID is required'
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const auction = await AuctionRequest.findOne({
      _id: req.query.id,
      started_auction: 'yes'
    })
      .populate('sellerId', 'firstName lastName email phone city state')
      .populate('assignedMechanic', 'firstName lastName')
      .exec();

    if (!auction) {
      return res.status(404).render('buyer_dashboard/error.ejs', {
        user,
        message: 'Auction not found or has ended'
      });
    }

    // Format mechanic name if available
    if (auction.assignedMechanic) {
      auction.mechanicName = `${auction.assignedMechanic.firstName} ${auction.assignedMechanic.lastName}`;
    }

    return res.render('buyer_dashboard/auction_detail.ejs', {
      auction,
      seller: auction.sellerId,
      user
    });
  } catch (err) {
    console.error('Error in auction_detail route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.session.user || {},
      message: 'An error occurred while loading the auction details'
    });
  }
});

// Direct route for auction bidding page
router.get('/auction', isBuyerLoggedIn, async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(404).render('buyer_dashboard/error.ejs', {
        user: req.session.user || {},
        message: 'Auction ID is required'
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const auction = await AuctionRequest.findOne({ 
      _id: req.query.id,
      started_auction: 'yes'
    })
      .populate('sellerId', 'firstName lastName email phone city state')
      .exec();

    if (!auction) {
      return res.status(404).render('buyer_dashboard/error.ejs', {
        user,
        message: 'Auction not found or has ended'
      });
    }

    // Fetch current bid (most recent bid marked as current)
    const currentBid = await AuctionBid.findOne({ auctionId: req.query.id, isCurrentBid: true })
      .sort({ bidTime: -1 });

    // Check if the logged-in user is the current bidder
    const isCurrentBidder = currentBid && req.session.userId === currentBid.buyerId.toString();

    return res.render('buyer_dashboard/auction.ejs', {
      auction,
      currentBid,
      isLoggedIn: !!req.session.userId,
      isCurrentBidder,
      user
    });
  } catch (err) {
    console.error('Error in auction route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.session.user || {},
      message: 'An error occurred while loading the auction'
    });
  }
});

// Route to handle bid placement
router.post('/auction/place-bid', isBuyerLoggedIn, async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const buyerId = req.session.userId;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Auction ID and bid amount are required' });
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    // Fetch auction
    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Check if auction is active and not stopped
    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.status(400).json({ success: false, message: 'Auction is not active or has been stopped' });
    }

    // Fetch current bid
    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    // Check if the buyer is the current bidder
    if (currentBid && currentBid.buyerId.toString() === buyerId) {
      return res.status(400).json({ success: false, message: 'You already have the current bid' });
    }

    // Validate bid amount
    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
    if (bidValue < minBid) {
      return res.status(400).json({ 
        success: false, 
        message: `Your bid must be at least ₹${minBid.toLocaleString()}` 
      });
    }

    // Create new bid
    const newBid = new AuctionBid({
      auctionId,
      sellerId: auction.sellerId,
      buyerId,
      bidAmount: bidValue,
      isCurrentBid: true
    });

    // Save the bid (pre-save middleware will handle making previous bids non-current)
    await newBid.save();

    return res.json({ success: true, message: 'Bid placed successfully' });
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API to get wishlist items
router.get('/api/wishlist', isBuyerLoggedIn, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = new Wishlist({
        userId: req.session.userId,
        auctions: [],
        rentals: []
      });
      await wishlist.save();
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
    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.session.userId,
        auctions: [],
        rentals: []
      });
    }
    
    // Add item to wishlist
    if (type === 'rental' && rentalId) {
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
    } else if (type === 'auction' && auctionId) {
      // Check if auction exists and is active or stopped
      const auction = await AuctionRequest.findOne({ 
        _id: auctionId,
        started_auction: 'yes'
      });
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found or has ended'
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
      message: 'Item added to wishlist',
      wishlist: {
        auctions: wishlist.auctions,
        rentals: wishlist.rentals
      }
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    return res.status(500).json({
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
    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get wishlist
    const wishlist = await Wishlist.findOne({ userId: req.session.userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Remove item from wishlist
    if (type === 'rental' && rentalId) {
      wishlist.rentals = wishlist.rentals.filter(id => id.toString() !== rentalId);
    } else if (type === 'auction' && auctionId) {
      wishlist.auctions = wishlist.auctions.filter(id => id.toString() !== auctionId);
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist: {
        auctions: wishlist.auctions,
        rentals: wishlist.rentals
      }
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

module.exports = router;