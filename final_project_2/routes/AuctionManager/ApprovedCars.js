const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');

// Helper function to safely capitalize strings
const safeCapitalize = (str) => {
  if (!str || typeof str !== 'string') return 'Not specified';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'Not specified';
  try {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'Invalid date';
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

router.get('/approvedcars', async (req, res) => {
  try {
    const approvedCars = await AuctionRequest.find({ status: 'approved' })
      .populate('sellerId', 'firstName lastName city email');
    
    res.render('auctionmanager/approvedcars', { approvedCars });
  } catch (err) {
    console.error('Error fetching approved cars:', err);
    res.render('auctionmanager/approvedcars', { approvedCars: [] });
  }
});

// Route to start an auction
router.post('/start-auction/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    await AuctionRequest.findByIdAndUpdate(carId, { started_auction: 'yes' });
    res.redirect('/auctionmanager/approvedcars');
  } catch (err) {
    console.error('Error starting auction:', err);
    res.status(500).json({ error: 'Failed to start auction' });
  }
});

// Route to stop an auction
router.post('/stop-auction/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    await AuctionRequest.findByIdAndUpdate(carId, { started_auction: 'ended' });
    res.redirect('/auctionmanager/approvedcars');
  } catch (err) {
    console.error('Error stopping auction:', err);
    res.status(500).json({ error: 'Failed to stop auction' });
  }
});

// Route to view bids
router.get('/view-bids/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    const auction = await AuctionRequest.findById(carId)
      .populate('sellerId', 'firstName lastName email city')
      .lean();
    
    if (!auction) {
      return res.redirect('/auctionmanager/approvedcars');
    }

    // Fetch bids for this auction
    const bids = await AuctionBid.getBidsForAuction(carId);
    const currentBid = bids.find(bid => bid.isCurrentBid) || null;
    const pastBids = bids.filter(bid => !bid.isCurrentBid).slice(0, 3); // Get up to 3 past bids

    res.render('auctionmanager/view-bids', {
      auction,
      currentBid,
      pastBids,
      helpers: {
        capitalize: safeCapitalize,
        formatDate,
        formatCurrency
      }
    });
  } catch (err) {
    console.error('Error viewing bids:', err);
    res.redirect('/auctionmanager/approvedcars');
  }
});

module.exports = router;