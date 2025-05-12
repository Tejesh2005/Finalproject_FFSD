const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const RentalRequest = require("../../models/RentalRequest");
const AuctionRequest = require("../../models/AuctionRequest");
const RentalCost = require("../../models/RentalCost");
const AuctionCost = require("../../models/AuctionCost");

// Middleware to check admin login
const isAdminLoggedIn = (req, res, next) => {
  if (!req.session.userId || req.session.userType !== "admin") {
    return res.redirect("/login");
  }
  next();
};

// GET: Show analytics page
router.get("/analytics", isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch total cars rented (completed rentals from RentalCost)
    const totalCarsRented = await RentalCost.countDocuments();

    // Fetch total auction listings
    const totalAuctionListings = await AuctionRequest.countDocuments();

    // Aggregate vehicle sales performance for auctions (all purchased cars)
    const auctionPerformance = await AuctionRequest.aggregate([
      {
        $match: {
          status: "approved",
          started_auction: "ended",
          winnerId: { $exists: true, $ne: null }, // Ensure a buyer has won
          vehicleName: { $exists: true, $ne: null },
          // Remove type checking to troubleshoot
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

    // Use auctionPerformance directly for vehiclePerformance
    const vehiclePerformance = auctionPerformance;

    // Debug: Log fetched data
    console.log("Total Users:", totalUsers);
    console.log("Total Cars Rented:", totalCarsRented);
    console.log("Total Auction Listings:", totalAuctionListings);
    console.log(
      "Auction Performance:",
      JSON.stringify(auctionPerformance, null, 2)
    );
    console.log(
      "Vehicle Performance:",
      JSON.stringify(vehiclePerformance, null, 2)
    );

    res.render("admin_dashboard/analytics.ejs", {
      totalUsers,
      totalCarsRented,
      totalAuctionListings,
      vehiclePerformance,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).render("admin_dashboard/analytics.ejs", {
      totalUsers: 0,
      totalCarsRented: 0,
      totalAuctionListings: 0,
      vehiclePerformance: [],
      error: "Failed to load analytics data: " + err.message,
    });
  }
});

module.exports = router;
