// Backend/routes/mechanic.routes.js
const express = require('express');
const router = express.Router();
const AuctionRequest = require('../models/AuctionRequest');
const User = require('../models/User');
const mechanicMiddleware = require('../middlewares/mechanic.middleware');

/* ---------- Dashboard (index) ---------- */
router.get('/dashboard', mechanicMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (user.approved_status !== 'Yes') {
      return res.json({
        success: true,
        message: 'Mechanic not approved',
        data: { showApprovalPopup: true, assignedVehicles: [], displayedVehicles: [], completedTasks: [], allCompletedTasks: [] }
      });
    }

    const assignedVehicles = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      status: 'assignedMechanic',
      reviewStatus: 'pending'
    }).sort({ createdAt: -1 });

    const allCompletedTasks = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      reviewStatus: 'completed'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Dashboard data',
      data: {
        user,
        assignedVehicles,
        displayedVehicles: assignedVehicles.slice(0, 3),
        completedTasks: allCompletedTasks.slice(0, 2),
        allCompletedTasks,
        showApprovalPopup: false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: {} });
  }
});
