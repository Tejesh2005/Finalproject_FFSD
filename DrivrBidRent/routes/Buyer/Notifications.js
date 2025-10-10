const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

// Get notifications page
router.get('/notifications', isBuyerLoggedin, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ userId })
      .populate('auctionId', 'vehicleName vehicleImage')
      .sort({ createdAt: -1 });
    
    // Get unread count for the badge
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.render('buyer_dashboard/notifications', {
      user: req.user,
      notifications,
      unreadCount,
      activePage: 'notifications'
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.render('buyer_dashboard/notifications', {
      user: req.user,
      notifications: [],
      unreadCount: 0,
      error: 'Failed to load notifications'
    });
  }
});

// Mark notification as read
router.post('/notifications/:id/read', isBuyerLoggedin, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/notifications/mark-all-read', isBuyerLoggedin, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

// Get unread notifications count (for navbar badge)
router.get('/api/notifications/unread-count', isBuyerLoggedin, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.json({ success: false, unreadCount: 0 });
  }
});

module.exports = router;