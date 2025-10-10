// routes/Seller/profile.js
const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updatePreferences, 
  changePassword 
} = require('../../controllers/sellerControllers/profileController');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show seller profile page
router.get('/profile', isSellerLoggedin, getProfile);

// POST: Update profile
router.post('/update-profile', isSellerLoggedin, updateProfile);

// POST: Update notification preferences
router.post('/update-preferences', isSellerLoggedin, updatePreferences);

// POST: Change password
router.post('/change-password', isSellerLoggedin, changePassword);

module.exports = router;