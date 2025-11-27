import User from '../../models/User.js';
import RentalCost from '../../models/RentalCost.js';
import AuctionCost from '../../models/AuctionCost.js';
import AuctionBid from '../../models/AuctionBid.js';
import AuctionRequest from '../../models/AuctionRequest.js';

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ userType: "buyer" });
    const totalSellers = await User.countDocuments({ userType: "seller" });
    const totalMechanics = await User.countDocuments({ userType: "mechanic" });

    const rentalCosts = await RentalCost.find()
      .populate("sellerId", "firstName lastName")
      .populate("rentalCarId", "vehicleName")
      .lean();

    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    const auctionCosts = await AuctionCost.find()
      .populate("sellerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .lean();

    const totalAuctionEarnings = auctionCosts.reduce((sum, cost) => sum + (cost.totalAmount || 0), 0);
    const totalEarnings = totalRentalEarnings + totalAuctionEarnings;

    const rentalActivities = rentalCosts.map((cost) => ({
      description: `Rental earning: ₹${cost.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from ${cost.sellerId?.firstName || ""} ${cost.sellerId?.lastName || ""} (${cost.rentalCarId?.vehicleName || "Unknown"})`,
      timestamp: cost.createdAt,
    }));

    const auctionActivities = auctionCosts.map((cost) => ({
      description: `Auction earning: ₹${cost.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from ${cost.sellerId?.firstName || ""} ${cost.sellerId?.lastName || ""} (${cost.auctionId?.vehicleName || "Unknown"})`,
      timestamp: cost.paymentDate,
    }));

    const recentBids = await AuctionBid.find()
      .populate("buyerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .sort({ bidTime: -1 })
      .limit(5)
      .lean();

    const bidActivities = recentBids.map((bid) => ({
      description: `New bid: ₹${bid.bidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} by ${bid.buyerId?.firstName || ""} ${bid.buyerId?.lastName || ""} on ${bid.auctionId?.vehicleName || "Unknown"}`,
      timestamp: bid.bidTime,
    }));

    const recentAuctions = await AuctionRequest.find({ status: "approved" })
      .populate("sellerId", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const auctionApprovalActivities = recentAuctions.map((auction) => ({
      description: `Auction approved for ${auction.vehicleName} by ${auction.sellerId?.firstName || ""} ${auction.sellerId?.lastName || ""}`,
      timestamp: auction.updatedAt,
    }));

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName createdAt")
      .lean();

    const userActivities = recentUsers.map((user) => ({
      description: `New user registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt,
    }));

    const recentActivity = [
      ...userActivities,
      ...rentalActivities,
      ...auctionActivities,
      ...bidActivities,
      ...auctionApprovalActivities,
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalMechanics,
        totalEarnings,
        recentActivity,
      },
    });
  } catch (err) {
    console.error("Error fetching admin dashboard:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      data: null,
    });
  }
};

export default { getAdminDashboard };