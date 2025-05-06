const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

router.get("/current-tasks", async (req, res) => {
    if (!req.session.userId || req.session.userType !== "mechanic") {
        return res.redirect("/login");
    }

    try {
        const assignedVehicles = await AuctionRequest.find({
            assignedMechanic: req.session.userId,
            status: 'assignedMechanic'
        }).sort({ createdAt: -1 });

        res.render("mechanic_dashboard/current-tasks.ejs", { 
            assignedVehicles
        });
    } catch (err) {
        console.error(err);
        res.render("mechanic_dashboard/current-tasks.ejs", { 
            assignedVehicles: []
        });
    }
});

module.exports = router;