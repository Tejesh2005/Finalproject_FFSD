const RentalRequest = require("../models/RentalRequest");
const AuctionRequest = require("../models/AuctionRequest");

const homeController = {
  getHomeData: async (req, res) => {
    try {
      const topRentals = await RentalRequest.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(4);

      const topAuctions = await AuctionRequest.find({ started_auction: 'yes'})
        .sort({ auctionDate: -1 })
        .limit(4);

      return res.status(200).json({
        success: true,
        message: 'Home data fetched successfully',
        data: { topRentals, topAuctions }
      });
    } catch (err) {
      console.error("Error fetching top rentals and auctions:", err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load top rentals and auctions',
        data: { topRentals: [], topAuctions: [] }
      });
    }
  }
};

module.exports = homeController;