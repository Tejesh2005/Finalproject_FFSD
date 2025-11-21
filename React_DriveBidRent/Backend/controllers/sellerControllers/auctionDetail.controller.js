// controllers/sellerControllers/auctionDetail.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

export const getAuctionDetail = async (req, res) => {
  try {
    const auction = await AuctionRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    }).lean();
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    res.json({ success: true, data: auction });
  } catch (err) {
    console.error('Error fetching auction details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch auction details' });
  }
};