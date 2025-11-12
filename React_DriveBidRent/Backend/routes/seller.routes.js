const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { postAddAuction } = require('../controllers/sellerControllers/addAuction.controller');
const { postAddRental } = require('../controllers/sellerControllers/addRental.controller');
const { getAuctionDetail } = require('../controllers/sellerControllers/auctionDetail.controller');
const { getProfile, updateProfile, updatePreferences, changePassword } = require('../controllers/sellerControllers/profile.controller');
const { getRentalDetail } = require('../controllers/sellerControllers/rentalDetail.controller');
const { getSellerDashboard } = require('../controllers/sellerControllers/sellerDashboard.controller');
const { postUpdateRental } = require('../controllers/sellerControllers/updateRental.controller');
const { getViewAuctions, getViewBids } = require('../controllers/sellerControllers/viewAuctions.controller');
const { getViewEarnings } = require('../controllers/sellerControllers/viewEarnings.controller');
const { getViewRentals, postToggleRentalStatus } = require('../controllers/sellerControllers/viewRentals.controller');

// POST: Add auction
router.post('/add-auction', upload.single('vehicleImage'), postAddAuction);

// POST: Add rental
router.post('/add-rental', upload.single('vehicleImage'), postAddRental);

// GET: Auction detail
router.get('/auction-details/:id', getAuctionDetail);

// GET: Profile
router.get('/profile', getProfile);
// POST: Update profile
router.post('/update-profile', updateProfile);
// POST: Update preferences
router.post('/update-preferences', updatePreferences);
// POST: Change password
router.post('/change-password', changePassword);

// GET: Rental detail
router.get('/rental-details/:id', getRentalDetail);

// GET: Seller dashboard
router.get('/seller', getSellerDashboard);

// POST: Update rental
router.post('/update-rental/:id', postUpdateRental);

// GET: View auctions
router.get('/view-auctions', getViewAuctions);
// GET: View bids
router.get('/view-bids/:id', getViewBids);

// GET: View earnings
router.get('/view-earnings', getViewEarnings);

// GET: View rentals
router.get('/view-rentals', getViewRentals);
// POST: Toggle rental status
router.post('/toggle-rental-status/:id', postToggleRentalStatus);

module.exports = router;