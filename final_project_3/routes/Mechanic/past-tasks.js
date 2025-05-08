const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

router.get("/past-tasks", async (req, res) => {
    if (!req.session.userId || req.session.userType !== "mechanic") {
        return res.redirect("/login");
    }

    try {
        const completedTasks = await AuctionRequest.find({
            assignedMechanic: req.session.userId,
            reviewStatus: 'completed'
        }).sort({ createdAt: -1 });

        res.render("mechanic_dashboard/past-tasks.ejs", { 
            completedTasks
        });
    } catch (err) {
        console.error(err);
        res.render("mechanic_dashboard/past-tasks.ejs", { 
            completedTasks: []
        });
    }
});

module.exports = router;  