import User from '../../models/User.js';
import RentalCost from '../../models/RentalCost.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionCost from '../../models/AuctionCost.js';

const getManageEarnings = async (req, res) => {
  try {
    const rentalCosts = await RentalCost.find()
      .populate('sellerId', 'firstName lastName')
      .populate('rentalCarId', 'vehicleName')
      .lean();

    const totalRentalCost = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);
    const totalRentalRevenue = totalRentalCost * 0.04;

    const auctionCosts = await AuctionCost.find()
      .populate('sellerId', 'firstName lastName')
      .lean();

    const totalAuctionRevenue = auctionCosts.reduce((sum, auction) => sum + (auction.convenienceFee || 0), 0);

    const totalRevenue = totalRentalRevenue + totalAuctionRevenue;

    const rentalTransactions = rentalCosts.slice(0, 5).map(cost => ({
      utrNumber: null,
      userName: cost.sellerId ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}` : 'Unknown',
      type: 'Rental',
      amount: cost.totalCost,
      createdAt: cost.createdAt
    }));

    const auctionTransactions = auctionCosts.slice(0, 5).map(auction => ({
      utrNumber: null,
      userName: auction.sellerId ? `${auction.sellerId.firstName} ${auction.sellerId.lastName}` : 'Unknown',
      type: 'Auction',
      amount: auction.convenienceFee,
      createdAt: auction.paymentDate
    }));

    const transactions = [...rentalTransactions, ...auctionTransactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      message: "Earnings data fetched successfully",
      data: {
        totalRevenue,
        totalAuctionRevenue,
        totalRentalRevenue,
        transactions,
      },
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load earnings data',
      data: null,
    });
  }
};

export default { getManageEarnings };