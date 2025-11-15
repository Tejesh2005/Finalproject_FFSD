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


/* ---------- Pending Tasks (dynamic from AuctionRequest) ---------- */
router.get('/pending-tasks', mechanicMiddleware, async (req, res) => {
  try {
    const pendingTasks = await AuctionRequest.find({
      status: 'pending',
      assignedMechanic: req.user._id
    }).populate('sellerId', 'firstName lastName');

    const tasks = pendingTasks.map(ar => ({
      _id: ar._id,
      vehicle: ar,
      owner: `${ar.sellerId.firstName} ${ar.sellerId.lastName}`
    }));

    res.json({ success: true, message: 'Pending tasks', data: { tasks } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: { tasks: [] } });
  }
});

/* ---------- Accept Pending Task ---------- */
router.post('/pending-tasks/:id/accept', mechanicMiddleware, async (req, res) => {
  try {
    const task = await AuctionRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending', assignedMechanic: req.user._id },
      { status: 'assignedMechanic' },
      { new: true }
    );

    if (!task) {
      return res.status(400).json({ success: false, message: 'Task not found or not pending' });
    }

    res.json({ success: true, message: 'Task accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error accepting task' });
  }
});

/* ---------- Decline Pending Task ---------- */
router.post('/pending-tasks/:id/decline', mechanicMiddleware, async (req, res) => {
  try {
    const task = await AuctionRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending', assignedMechanic: req.user._id },
      { status: 'rejected' },
      { new: true }
    );

    if (!task) {
      return res.status(400).json({ success: false, message: 'Task not found or not pending' });
    }

    res.json({ success: true, message: 'Task declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error declining task' });
  }
});
