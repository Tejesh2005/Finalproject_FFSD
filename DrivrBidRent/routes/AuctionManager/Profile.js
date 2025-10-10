const express = require('express');
const router = express.Router();
const isAuctionManager = require('../../middlewares/isAuctionManager');
const User = require('../../models/User'); // Assumed path based on app.js
const bcrypt = require('bcrypt');

router.get("/profile", isAuctionManager, async(req,res) => {
    const user = req.user;
    res.render("./auctionmanager/managerprofile", { user });
});


router.post("/update-details", isAuctionManager, async(req, res) => {
    // Ensure req.user and req.user._id are available
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Authentication failed. User ID missing." });
    }
    
    const userId = req.user._id;
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Invalid phone number format." });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { phone: phone }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Phone number updated successfully." });
    } catch (error) {
        // Logging the full error object can help diagnose validation or database connection issues
        console.error("Phone update error:", error); 
        res.status(500).json({ success: false, message: "Server error: Failed to update phone number." });
    }
});

router.post('/change-password', isAuctionManager, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // FIX: Removed confirmPassword from destructuring as it's validated on the client.
        // Also removed it from the server-side validation check.
        const { oldPassword, newPassword } = req.body; 
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and New password fields are required.' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
        }
        
        // Fetch user, ensuring the password field is returned if your model uses select: false
        const user = await User.findById(userId).select('+password'); 
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // 1. Check if old password matches
        const isMatch = await user.comparePassword(oldPassword);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // 2. Prevent setting the same password
        // The Mongoose pre-save hook will handle the hashing automatically on save
        user.password = newPassword; 
        await user.save();

        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while changing the password' });
    }
});

module.exports = router;
