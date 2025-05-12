const express = require('express');
const router = express.Router();
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const Purchase = require('../../models/Purchase');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Session-based authentication middleware
const ensureAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Purchase page route - display user's rentals and auction purchases
router.get('/purchase', ensureAuthenticated, async (req, res) => {
  try {
    // Get the current user's ID from session
    const buyerId = req.session.userId;
    
    // Get the user object for rendering
    const user = await User.findById(buyerId);
    if (!user) {
      return res.redirect('/login');
    }

    // Find all rental costs where the user is the buyer
    const rentalCosts = await RentalCost.find({ buyerId });
    
    // Get the rental details for each rental cost
    const rentals = await Promise.all(rentalCosts.map(async (rentalCost) => {
      // Get the rental request details
      const rentalRequest = await RentalRequest.findById(rentalCost.rentalCarId);
      
      if (!rentalRequest) {
        return null; // Skip if rental request not found
      }
      
      // Get the seller details
      const seller = await User.findById(rentalCost.sellerId);
      
      if (!seller) {
        return null; // Skip if seller not found
      }
      
      // Combine the data
      return {
        _id: rentalRequest._id,
        vehicleName: rentalRequest.vehicleName,
        vehicleImage: rentalRequest.vehicleImage,
        costPerDay: rentalRequest.costPerDay,
        pickupDate: rentalRequest.pickupDate,
        dropDate: rentalRequest.dropDate,
        totalCost: rentalCost.totalCost,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        sellerPhone: seller.phone
      };
    }));

    // Filter out null values (from rentals not found)
    const validRentals = rentals.filter(rental => rental !== null);

    // Find all purchases where the user is the buyer (both pending and completed)
    const auctionPurchases = await Purchase.find({ 
      buyerId
    });

    // Render the purchase page with rentals and auction purchases
    res.render('buyer_dashboard/purchase', { 
      rentals: validRentals, 
      auctionPurchases, 
      user 
    });
  } catch (err) {
    console.error('Error fetching purchase data:', err);
    res.status(500).render('buyer_dashboard/error', { 
      message: 'Failed to load purchase data',
      user: {}
    });
  }
});

// Purchase details route for auction purchases
router.get('/purchase_details', ensureAuthenticated, async (req, res) => {
  try {
    const purchaseId = req.query.id;
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).render('buyer_dashboard/error', { 
        message: 'Invalid purchase ID',
        user
      });
    }

    const purchase = await Purchase.findById(purchaseId)
      .populate('sellerId', 'firstName lastName email phone city state')
      .populate('auctionId');
    
    if (!purchase) {
      return res.status(404).render('buyer_dashboard/error', { 
        message: 'Purchase not found',
        user
      });
    }

    if (purchase.buyerId.toString() !== req.session.userId) {
      return res.status(403).render('buyer_dashboard/error', { 
        message: 'Unauthorized access to purchase details',
        user
      });
    }

    res.render('buyer_dashboard/purchase_details', { 
      purchase, 
      user 
    });
  } catch (err) {
    console.error('Error fetching purchase details:', err);
    res.status(500).render('buyer_dashboard/error', { 
      message: 'Failed to load purchase details',
      user: {}
    });
  }
});

// Rental details route - show complete details for a specific rental
router.get('/rental_details/:id', ensureAuthenticated, async (req, res) => {
  try {
    const rentalId = req.params.id;
    
    // Get the user object for rendering
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res.status(400).render('buyer_dashboard/error', { 
        message: 'Invalid rental ID',
        user
      });
    }
    
    // Find the rental
    const rentalRequest = await RentalRequest.findById(rentalId);
    
    if (!rentalRequest) {
      return res.status(404).render('buyer_dashboard/error', { 
        message: 'Rental not found',
        user
      });
    }
    
    // Find the rental cost
    const rentalCost = await RentalCost.findOne({ rentalCarId: rentalId });
    
    if (!rentalCost) {
      return res.status(404).render('buyer_dashboard/error', { 
        message: 'Rental cost details not found',
        user
      });
    }
    
    // Find the seller
    const seller = await User.findById(rentalRequest.sellerId);
    
    if (!seller) {
      return res.status(404).render('buyer_dashboard/error', { 
        message: 'Seller details not found',
        user
      });
    }
    
    // Prepare the data for rendering
    const rentalDetails = {
      vehicleName: rentalRequest.vehicleName,
      vehicleImage: rentalRequest.vehicleImage,
      year: rentalRequest.year,
      AC: rentalRequest.AC,
      capacity: rentalRequest.capacity,
      condition: rentalRequest.condition,
      fuelType: rentalRequest.fuelType,
      transmission: rentalRequest.transmission,
      costPerDay: rentalRequest.costPerDay,
      driverAvailable: rentalRequest.driverAvailable,
      driverRate: rentalRequest.driverRate,
      pickupDate: new Date(rentalRequest.pickupDate).toLocaleDateString(),
      dropDate: new Date(rentalRequest.dropDate).toLocaleDateString(),
      totalCost: rentalCost.totalCost,
      seller: {
        name: `${seller.firstName} ${seller.lastName}`,
        email: seller.email,
        phone: seller.phone,
        address: seller.doorNo && seller.street ? 
          `${seller.doorNo}, ${seller.street}, ${seller.city}, ${seller.state}` : 
          'Address not available'
      }
    };
    
    // Render the rental details page
    res.render('buyer_dashboard/rental_details', { rental: rentalDetails, user });
  } catch (err) {
    console.error('Error fetching rental details:', err);
    res.status(500).render('buyer_dashboard/error', { 
      message: 'Failed to load rental details',
      user: {}
    });
  }
});

module.exports = router;