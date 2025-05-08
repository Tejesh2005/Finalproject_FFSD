const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const Purchase = require('../../models/Purchase');
const AuctionCost = require('../../models/AuctionCost');
const User = require('../../models/User');

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Route to render auction page
router.get('/auction', isLoggedIn, async (req, res) => {
  try {
    const auctionId = req.query.id;
    if (!auctionId) {
      return res.status(400).render('error', { message: 'Auction ID is required' });
    }

    // Fetch auction details, include stopped but not ended auctions
    const auction = await AuctionRequest.findOne({ 
      _id: auctionId,
      started_auction: 'yes'
    });
    if (!auction) {
      return res.status(404).render('error', { message: 'Auction not found or has ended' });
    }

    // Fetch current bid (most recent bid marked as current)
    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    // Check if the logged-in user is the current bidder
    const isCurrentBidder = currentBid && req.session.userId === currentBid.buyerId.toString();

    // Render auction page
    res.render('auction', {
      auction,
      currentBid,
      isLoggedIn: !!req.session.userId,
      isCurrentBidder
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Route to handle bid placement
router.post('/auction/place-bid', isLoggedIn, async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const buyerId = req.session.userId;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Auction ID and bid amount are required' });
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    // Fetch auction
    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Check if auction is active and not stopped
    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.status(400).json({ success: false, message: 'Auction is not active or has been stopped' });
    }

    // Fetch current bid
    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    // Check if the buyer is the current bidder
    if (currentBid && currentBid.buyerId.toString() === buyerId) {
      return res.status(400).json({ success: false, message: 'You already have the current bid' });
    }

    // Validate bid amount
    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
    if (bidValue < minBid) {
      return res.status(400).json({ 
        success: false, 
        message: `Your bid must be at least ₹${minBid.toLocaleString()}` 
      });
    }

    // Create new bid
    const newBid = new AuctionBid({
      auctionId,
      sellerId: auction.sellerId,
      buyerId,
      bidAmount: bidValue,
      isCurrentBid: true
    });

    // Save the bid (pre-save middleware will handle making previous bids non-current)
    await newBid.save();

    return res.json({ success: true, message: 'Bid placed successfully' });
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user is the auction winner and get payment status
router.get('/auction/winner-status/:id', isLoggedIn, async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (!auction.auction_stopped) {
      return res.json({ isWinner: false });
    }

    const isWinner = auction.winnerId && auction.winnerId.toString() === req.session.userId.toString();
    if (!isWinner) {
      return res.json({ isWinner: false });
    }

    const purchase = await Purchase.findOne({ auctionId: auction._id, buyerId: req.session.userId });
    res.json({
      isWinner: true,
      bidAmount: auction.finalPurchasePrice,
      paymentStatus: purchase ? purchase.paymentStatus : 'pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to fetch payment details for the popup
router.get('/auction/confirm-payment/:id', isLoggedIn, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const userId = req.session.userId;

    // Fetch the purchase details
    const purchase = await Purchase.findOne({ auctionId, buyerId: userId });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // Calculate convenience fee (1% of purchase price)
    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    // Return the data for the popup
    res.json({
      success: true,
      purchaseId: purchase._id,
      auctionId: purchase.auctionId,
      amount: purchase.purchasePrice,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to handle final payment submission
router.post('/auction/complete-payment/:id', isLoggedIn, async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userId = req.session.userId;

    // Fetch the purchase
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.buyerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // Calculate convenience fee and total amount
    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    // Save to AuctionCost, including the sellerId from the Purchase document
    const auctionCost = new AuctionCost({
      auctionId: purchase.auctionId,
      buyerId: userId,
      sellerId: purchase.sellerId, // Add sellerId from Purchase
      amountPaid: purchase.purchasePrice,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount,
      paymentDate: new Date()
    });
    await auctionCost.save();

    // Update Purchase to mark payment as completed
    purchase.paymentStatus = 'completed';
    await purchase.save();

    res.json({ success: true, message: 'Payment completed successfully' });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;