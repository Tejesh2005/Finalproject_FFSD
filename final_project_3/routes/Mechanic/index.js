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
        
        // Check if mechanic is approved
        if (user.approved_status !== 'Yes') {
            return res.render("mechanic_dashboard/index.ejs", { 
                user,
                showApprovalPopup: true,
                assignedVehicles: [],
                displayedVehicles: []
            });
        }

        // Get current assigned vehicles (status: 'assignedMechanic')
        const assignedVehicles = await AuctionRequest.find({
            assignedMechanic: req.session.userId,
            status: 'assignedMechanic'
        }).sort({ createdAt: -1 });

        // Get recently completed tasks (optional - if you want to show past tasks)
        const completedTasks = await AuctionRequest.find({
            assignedMechanic: req.session.userId,
            status: 'completed' // You'll need to add this status to your schema
        }).sort({ createdAt: -1 }).limit(2);

        res.render("mechanic_dashboard/index.ejs", { 
            user,
            assignedVehicles,
            displayedVehicles: assignedVehicles.slice(0, 3),
            completedTasks, // Pass to template if you want real past tasks
            showApprovalPopup: false
        });
    } catch (err) {
        console.error(err);
        res.render("mechanic_dashboard/index.ejs", { 
            user: {},
            assignedVehicles: [],
            displayedVehicles: [],
            completedTasks: [],
            showApprovalPopup: false
        });
    }
});

module.exports = router;