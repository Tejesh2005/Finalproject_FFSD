const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');
const bcrypt = require('bcrypt');

router.get("/profile", isBuyerLoggedin, async (req, res) => {
    const user = req.user;
    res.render("./buyer_dashboard/profile", { user });
});
router.post('/update-profile', isBuyerLoggedin, async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;

        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Required fields are missing' });
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
        }
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                email,
                phone,
                doorNo: doorNo || '',
                street: street || '',
                city: city || '',
                state: state || ''
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, message: 'Profile updated successfully', user: updatedUser , userId: userId, userEmail: email, userFirstName: firstName, userLastName: lastName, userPhone: phone, userDoorNo: doorNo, userStreet: street, userCity: city, userState: state });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while updating the profile' });
    }
});

router.post('/change-password', isBuyerLoggedin, async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();

        return res.json({ success: true, message: 'Password changed successfully', userId: userId , userEmail: user.email, userFirstName: user.firstName, userLastName: user.lastName, userPhone: user.phone, userDoorNo: user.doorNo, userStreet: user.street, userCity: user.city, userState: user.state });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while changing the password' });
    }
});

module.exports = router;