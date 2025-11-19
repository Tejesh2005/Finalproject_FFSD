// controllers/sellerControllers/viewAuctions.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';

// GET: Get all auctions created by the logged-in seller
export const getViewAuctions = async (req, res) => {
  try {
    const auctions = await AuctionRequest.find({ sellerId: req.user._id })
      .populate('assignedMechanic', 'firstName lastName doorNo street city state')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: auctions || []
    });
  } catch (err) {
    console.error('Error fetching auction data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load auction data'
    });
  }
};

// GET: Get bids for a specific auction (with auction details)
export const getViewBids = async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await AuctionRequest.findOne({
      _id: auctionId,
      sellerId: req.user._id
    })
      .populate('assignedMechanic', 'firstName lastName doorNo street city state')
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if auction is approved and has started
    if (!['approved', 'assignedMechanic'].includes(auction.status)) {
      return res.status(400).json({
        success: false,
        message: 'This auction has not been approved yet.'
      });
    }

    if (!['yes', 'ended'].includes(auction.started_auction)) {
      return res.status(400).json({
        success: false,
        message: 'Auction has not yet started.'
      });
    }

    // Fetch all bids for this auction
    const bids = await AuctionBid.find({ auctionId })
      .populate('buyerId', 'firstName lastName email phone')
      .sort({ bidTime: -1 })
      .lean();

    // Separate current highest bid and recent bid history
    const currentBid = bids.find(bid => bid.isCurrentBid) || null;
    const bidHistory = bids.filter(bid => !bid.isCurrentBid).slice(0, 3);

    res.json({
      success: true,
      data: { auction, currentBid, bidHistory }
    });
  } catch (err) {
    console.error('Error accessing auction bids:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to access auction bids.'
    });
  }
};