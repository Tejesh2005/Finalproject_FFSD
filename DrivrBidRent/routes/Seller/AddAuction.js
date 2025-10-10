const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');
// FIX: Corrected path assumption
const { upload } = require('../../config/cloudinary'); // <<-- THIS LINE IS CHANGED

// GET: Show add auction page
router.get('/add-auction', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    res.render('seller_dashboard/add-auction.ejs', { user, error: null, formData: {} });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.render('seller_dashboard/add-auction.ejs', { user: {}, error: 'Failed to load user data', formData: {} });
  }
});

// POST: Handle Auction Submission
router.post(
  '/add-auction', 
  isSellerLoggedin, 
  upload.single('vehicleImage'), 
  async (req, res) => {
    console.log('POST request received to /add-auction');
    
    // NEW CHECK: Check if a file was successfully uploaded
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'Vehicle image upload failed or is missing.'
        });
    }

    try {
      const auction = new AuctionRequest({
        vehicleName: req.body['vehicle-name'],
        // Use the Cloudinary URL from req.file.path
        vehicleImage: req.file.path, 
        year: req.body['vehicle-year'],
        mileage: req.body['vehicle-mileage'],
        fuelType: req.body['fuel-type'],
        transmission: req.body['transmission'],
        condition: req.body['vehicle-condition'],
        auctionDate: req.body['auction-date'],
        startingBid: req.body['starting-bid'],
        sellerId: req.user._id,
        status: 'pending'
      });
      
      await auction.save();
      
      // Return JSON with redirect info
      res.json({
        success: true,
        message: 'Auction Request Submitted',
        redirect: '/seller_dashboard/view-auctions?success=Auction+Request+Submitted'
      });
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
          success: false,
          message: 'Failed to submit auction: ' + err.message
      });
    }
});

module.exports = router;