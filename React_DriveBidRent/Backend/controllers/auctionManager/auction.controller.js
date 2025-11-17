// controllers/auctionManager/auction.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import Purchase from '../../models/Purchase.js';
import User from '../../models/User.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const startAuction = async (req, res) => {
  try {
    const auction = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      { started_auction: 'yes' },
      { new: true }
    );
    if (!auction) return res.json(send(false, 'Auction not found'));
    res.json(send(true, 'Auction started'));
  } catch (err) {
    console.error('Start auction error:', err);
    res.json(send(false, 'Failed to start auction'));
  }
};

export const stopAuction = async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id);
    if (!auction || auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.json(send(false, 'Invalid auction state'));
    }

    const currentBid = await AuctionBid.findOne({ auctionId: auction._id, isCurrentBid: true })
      .populate('buyerId', 'firstName lastName email');

    auction.auction_stopped = true;
    auction.started_auction = 'ended';

    if (currentBid) {
      auction.winnerId = currentBid.buyerId._id;
      auction.finalPurchasePrice = currentBid.bidAmount;

      const seller = await User.findById(auction.sellerId);
      await Purchase.create({
        auctionId: auction._id,
        buyerId: currentBid.buyerId._id,
        sellerId: auction.sellerId,
        vehicleName: auction.vehicleName,
        vehicleImage: auction.vehicleImage,
        year: auction.year,
        mileage: auction.mileage,
        purchasePrice: currentBid.bidAmount,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        paymentStatus: 'pending'
      });

      await AuctionBid.notifyAuctionWinner(auction._id, currentBid.buyerId._id);
    }

    await auction.save();
    res.json(send(true, 'Auction stopped', { hasWinner: !!currentBid }));
  } catch (err) {
    console.error('Stop auction error:', err);
    res.json(send(false, 'Server error'));
  }
};

export const viewBids = async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id)
      .populate('sellerId', 'firstName lastName email city')
      .lean();

    if (!auction) return res.json(send(false, 'Auction not found'));

    const bids = await AuctionBid.getBidsForAuction(req.params.id);
    const currentBid = bids.find(b => b.isCurrentBid) || null;
    const pastBids = bids.filter(b => !b.isCurrentBid).slice(0, 3);

    res.json(send(true, 'Bids loaded', { auction, currentBid, pastBids }));
  } catch (err) {
    console.error('View bids error:', err);
    res.json(send(false, 'Failed to load bids'));
  }
};