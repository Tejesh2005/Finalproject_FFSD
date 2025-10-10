// routes/Seller/AddRental.js
const express = require('express');
const router = express.Router();
const { getAddRental, postAddRental } = require('../../controllers/sellerControllers/addRentalController');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');
const { upload } = require('../../config/cloudinary'); // FIX: Corrected path assumption

// GET: Show add rental page
router.get('/add-rental', isSellerLoggedin, getAddRental);

// POST: Handle rental submission
router.post(
  '/add-rental', 
  isSellerLoggedin, 
  upload.single('vehicleImage'),
  postAddRental
);

module.exports = router;