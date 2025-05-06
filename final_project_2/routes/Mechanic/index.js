const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');

router.get("/index", async (req, res) => {
    if (!req.session.userId || req.session.userType !== "mechanic") {
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(req.session.userId);
        const assignedVehicles = await AuctionRequest.find({
            assignedMechanic: req.session.userId,
            status: 'assignedMechanic'
        }).sort({ createdAt: -1 }); // Newest first

        res.render("mechanic_dashboard/index.ejs", { 
            user,
            assignedVehicles,
            displayedVehicles: assignedVehicles.slice(0, 3) // Only show first 3
        });
    } catch (err) {
        console.error(err);
        res.render("mechanic_dashboard/index.ejs", { 
            user: {},
            assignedVehicles: [],
            displayedVehicles: []
        });
    }
});

module.exports = router;