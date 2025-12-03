import User from '../../models/User.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import RentalCost from '../../models/RentalCost.js';
import AuctionCost from '../../models/AuctionCost.js';

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCarsRented = await RentalCost.countDocuments();
    const totalAuctionListings = await AuctionRequest.countDocuments();

    const vehiclePerformance = await AuctionRequest.aggregate([
      {
        $match: {
          status: "approved",
          started_auction: "ended",
          winnerId: { $exists: true, $ne: null },
          vehicleName: { $exists: true, $ne: null },
          startingBid: { $exists: true },
          finalPurchasePrice: { $exists: true },
        },
      },
      {
        $project: {
          vehicleName: 1,
          startingPrice: "$startingBid",
          finalSalePrice: "$finalPurchasePrice",
        },
      },
      { $sort: { finalSalePrice: -1 } },
    ]);

    res.json({
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        totalUsers,
        totalCarsRented,
        totalAuctionListings,
        vehiclePerformance,
      },
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics data: " + err.message,
      data: null,
    });
  }
};

export default { getAnalytics };