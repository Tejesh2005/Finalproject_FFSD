// Backend/controllers/auctionManager/dashboard.controller.js
const AuctionRequest = require('../../models/AuctionRequest');

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

exports.getDashboard = async (req, res) => {
  try {
    const [pending, assigned, approved] = await Promise.all([
      AuctionRequest.find({ status: 'pending' })
        .populate('sellerId', 'firstName lastName city')
        .sort({ createdAt: -1 })
        .limit(3),
      AuctionRequest.find({ status: 'assignedMechanic' })
        .populate('sellerId', 'firstName lastName city')
        .sort({ createdAt: -1 })
        .limit(3),
      AuctionRequest.find({ status: 'approved' })
        .populate('sellerId', 'firstName lastName city')
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    res.json(send(true, 'Dashboard data fetched', { pending, assigned, approved }));
  } catch (err) {
    console.error('Dashboard error:', err);
    res.json(send(false, 'Failed to load dashboard'));
  }
};