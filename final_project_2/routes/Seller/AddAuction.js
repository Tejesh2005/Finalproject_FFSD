const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model
const AuctionRequest = require('../../models/AuctionRequest'); // Make sure you have an AuctionRequest model
// Show Add Auction Page

// Middleware to check if user is logged in as seller
const isSellerLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== 'seller') {
    return res.redirect('/login');
  }
  next();
};

router.get('/add-auction', isSellerLoggedIn, async (req, res) => {

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    res.render('seller_dashboard/add-auction.ejs', { user });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.render('seller_dashboard/add-auction.ejs', { user: {}, error: 'Failed to load user data' });
  }
});


// POST: Handle Auction Submission
router.post('/add-auction', isSellerLoggedIn,async (req, res) => {

  console.log('POST request received to /add-auction');
    try {
      
      const auction = new AuctionRequest({
        vehicleName: req.body['vehicle-name'],
        vehicleImage: req.body['vehicle-image'],
        year: req.body['vehicle-year'],
        mileage: req.body['vehicle-mileage'],
        condition: req.body['vehicle-condition'],
        auctionDate: req.body['auction-date'],
        startingBid: req.body['starting-bid'],
        sellerId: req.session.userId || null, // Replace with actual user ID in real use
        status: 'pending'
      });
      console.log('hiii'); // Log the auction object for debugging
      await auction.save();
      console.log('Auction saved:', auction);
      res.redirect('/seller_dashboard/view-auctions'); // Redirect after saving
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to submit auction');
    }
  });
module.exports = router;
