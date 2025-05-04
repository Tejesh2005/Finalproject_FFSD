const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const addAuctionRoute = require("./routes/Seller/AddAuction"); // Import the addAuction route
const auctionDetailsRoutes = require("./routes/Seller/AuctionDetail");
const addRentalRoute = require("./routes/Seller/AddRental"); // Import the addRental route
const seller_profileRoute = require("./routes/Seller/profile");
const viewAuctionsRoute = require("./routes/Seller/ViewAuctions.js"); // Import the viewAuctions route
const viewRentalsRoute = require("./routes/Seller/ViewRentals.js"); // Import the viewRentals route
const viewearningsRoute = require("./routes/Seller/ViewEarnings.js"); // Import the viewearnings route
const rentalDetailsRoute = require("./routes/Seller/RentalDetails");

const AuctionManagerHomeRoute = require("./routes/AuctionManager/Home.js"); // Import the AuctionManagerHome route
const Auctionrequests = require("./routes/AuctionManager/Requests.js"); // Import the AuctionManagerHome route
const AssignMechanic = require("./routes/AuctionManager/AssignMechanic.js"); // Import the AuctionManagerHome route
const Pendingcars = require("./routes/AuctionManager/Pending.js"); // Import the AuctionManagerHome route
const approvedCars = require("./routes/AuctionManager/ApprovedCars.js"); // Import the AuctionManagerHome route
const PendingCarDetails = require("./routes/AuctionManager/PendingCarDetails.js");

const AdminHomepage = require("./routes/Admin/AdminHome.js");
const ManageUsers = require("./routes/Admin/ManageUSers.js");
const adminProfile = require("./routes/Admin/AdminProfile.js");
const Analytics = require("./routes/Admin/Analytics.js");
const ManageEarnings = require("./routes/Admin/ManageEarnings.js");

// const BuyerDashboard = require('./routes/Buyer/BuyerDashboard.js'); // Old import
const Aboutus = require("./routes/Buyer/Aboutus.js"); // Import the Aboutus route
// const AuctionRoute = require('./routes/Buyer/Auction.js'); // Old import

// New Buyer Route Imports
const BuyerDashboardRoute = require("./routes/Buyer/BuyerDashboard.js");
const BuyerAuctionRoute = require("./routes/Buyer/Auction.js");
const BuyerDriverRoute = require("./routes/Buyer/Driver.js");
const BuyerRentalRoute = require("./routes/Buyer/Rental.js");
const BuyerPurchaseRoute = require("./routes/Buyer/Purchase.js");
const BuyerWishlistRoute = require("./routes/Buyer/Wishlist.js");

const app = express();

const DriverDashboard = require("./routes/Driver/Dashboard.js"); // Import the DriverDashboard route

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://Jeevan:Bunny@123@cluster0.2jrrwqn.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Set up middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================
// ROUTES
// ======================

// Root route
app.get("/", (req, res) => {
  res.render("homepage.ejs");
});

// Auth routes
app.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

app.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      userType,
      dateOfBirth,
      drivingLicense,
      shopName,
      termsAccepted,
      phone,
      experienceYears,
      approved_status
    } = req.body;
    
    // Only get googleAddressLink if user is a mechanic
    const googleAddressLink = userType === 'mechanic' ? req.body.googleAddressLink : undefined;

    // Process address fields that might come as arrays
    const doorNo = Array.isArray(req.body.doorNo)
      ? req.body.doorNo[0]
      : req.body.doorNo;
    const street = Array.isArray(req.body.street)
      ? req.body.street[0]
      : req.body.street;
    const city = Array.isArray(req.body.city)
      ? req.body.city[0]
      : req.body.city;
    const state = Array.isArray(req.body.state)
      ? req.body.state[0]
      : req.body.state;

    // Handle vehicle types - simplified for only bikes and cars
    const repairBikes = req.body.repairBikes === "on";
    const repairCars = req.body.repairCars === "on";

    // Validate phone number (10 digits)
    if (!phone || !phone.match(/^\d{10}$/)) {
      return res.render("signup", {
        error: "Phone number must be 10 digits",
        formData: {
          firstName,
          lastName,
          email,
          userType,
          dateOfBirth,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    // Age validation
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.render("signup", {
        error: "You must be at least 18 years old to sign up",
        formData: {
          firstName,
          lastName,
          email,
          userType,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    // Validate input
    if (password !== confirmPassword) {
      return res.render("signup", {
        error: "Passwords do not match",
        formData: {
          firstName,
          lastName,
          email,
          userType,
          dateOfBirth,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    if (password.length < 8) {
      return res.render("signup", {
        error: "Password must be at least 8 characters long",
        formData: {
          firstName,
          lastName,
          email,
          userType,
          dateOfBirth,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    if (!termsAccepted) {
      return res.render("signup", {
        error: "You must accept the terms and conditions",
        formData: {
          firstName,
          lastName,
          email,
          userType,
          dateOfBirth,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists",
        formData: {
          firstName,
          lastName,
          userType,
          dateOfBirth,
          doorNo,
          street,
          city,
          state,
          drivingLicense,
          shopName,
          phone,
          experienceYears,
          repairBikes,
          repairCars,
          googleAddressLink
        },
      });
    }

    // Parse experienceYears as a number if it exists
    const parsedExperienceYears = experienceYears ? parseInt(experienceYears) : undefined;

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      dateOfBirth,
      doorNo,
      street,
      city,
      state,
      drivingLicense,
      shopName,
      phone,
      experienceYears: parsedExperienceYears,
      approved_status: approved_status || 'No', // Default to 'No' if not provided
      repairBikes,
      repairCars,
      googleAddressLink
    });

    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("signup", {
      error: "An error occurred during signup",
      formData: req.body,
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.userId = user._id;
    req.session.userType = user.userType;
    req.session.userName = `${user.firstName} ${user.lastName}`;

    if (req.session.userType === "buyer") {
      res.redirect("/buyer_dashboard?page=dashboard");
    } else if (req.session.userType === "seller") {
      res.redirect("/seller_dashboard/seller");
    } else if (req.session.userType === "driver") {
      res.redirect("/driver_dashboard/driverdashboard");
    } else if (req.session.userType === "mechanic") {
      res.redirect("/mechanic_dashboard/index");
    }else if (req.session.userType === "admin") {
      res.redirect("/admin");
    }
  } catch (err) {
    console.error(err);
    res.render("login", { error: "An error occurred during login" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Dashboard routes
app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }
    res.render("dashboard", { user: user });
  } catch (err) {
    console.error(err);
    res.render("dashboard", { error: "An error occurred", user: {} });
  }
});

// Mount the new buyer routes
app.use("/", BuyerDashboardRoute);
app.use("/", BuyerAuctionRoute);
app.use("/", BuyerDriverRoute);
app.use("/", BuyerRentalRoute);
app.use("/", BuyerPurchaseRoute);
app.use("/", BuyerWishlistRoute);
app.use("/", Aboutus);

// New Seller Dashboard Routes
app.get("/seller_dashboard/seller", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "seller") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }
    res.render("seller_dashboard/seller.ejs", { user });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/seller.ejs", { user: {} });
  }
});

// app.use('/seller_dashboard', SellerDashboard);
app.use("/seller_dashboard", addAuctionRoute);
app.use("/seller_dashboard", auctionDetailsRoutes);
app.use("/seller_dashboard", addRentalRoute);
app.use("/seller_dashboard", seller_profileRoute);
app.use("/seller_dashboard", viewAuctionsRoute);
app.use("/seller_dashboard", viewRentalsRoute);
app.use("/seller_dashboard", viewearningsRoute);
app.use("/seller_dashboard", rentalDetailsRoute);

app.get("/seller_dashboard/update-rental", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "seller") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    // Get rental ID from query parameters
    const rentalId = req.query.id;
    if (!rentalId) {
      return res.redirect("/seller_dashboard/view-rentals");
    }

    // In a real app, you would fetch the rental details from a database
    // For now, we'll just pass the ID

    res.render("seller_dashboard/update-rental.ejs", { user, rentalId });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/update-rental.ejs", {
      user: {},
      error: "Failed to load data",
    });
  }
});

app.get("/seller_dashboard/view-bids", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "seller") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    // Get auction ID from query parameters
    const auctionId = req.query.id;
    if (!auctionId) {
      return res.redirect("/seller_dashboard/view-auctions");
    }

    // In a real app, you would fetch the bids for this auction from a database
    // For now, we'll just pass the ID

    res.render("seller_dashboard/view-bids.ejs", { user, auctionId });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/view-bids.ejs", {
      user: {},
      error: "Failed to load data",
    });
  }
});

app.get("/seller_dashboard/view-rentals", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "seller") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    // In a real app, you would fetch rentals from a database
    // For now, we'll just render the template

    res.render("seller_dashboard/view-rentals.ejs", { user });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/view-rentals.ejs", {
      user: {},
      error: "Failed to load data",
    });
  }
});

app.use("/driver_dashboard", DriverDashboard);

// Mechanic Dashboard routes
app.get("/mechanic_dashboard/index", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "mechanic") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    res.render("mechanic_dashboard/index.ejs", { user });
  } catch (err) {
    console.error(err);
    res.render("mechanic_dashboard/index.ejs", { user: {} });
  }
});

app.use("/auctionmanager", AuctionManagerHomeRoute);
app.use("/auctionmanager", Auctionrequests);
app.use("/auctionmanager", AssignMechanic);
app.use("/auctionmanager", Pendingcars);
app.use("/auctionmanager", approvedCars);
app.use("/auctionmanager", PendingCarDetails);

app.use("/", AdminHomepage);
app.use("/", ManageUsers);
app.use("/", adminProfile);
app.use("/", Analytics);
app.use("/", ManageEarnings);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

app.get("/mechanic_dashboard/current-tasks", (req, res) => {
  res.render("mechanic_dashboard/current-tasks.ejs");
});
app.get("/mechanic_dashboard/pending-tasks", (req, res) => {
  res.render("mechanic_dashboard/pending-tasks.ejs");
});
app.get("/mechanic_dashboard/past-tasks", (req, res) => {
  res.render("mechanic_dashboard/past-tasks.ejs");
});
app.get("/mechanic_dashboard/profile", (req, res) => {
  res.render("mechanic_dashboard/profile.ejs");
});
app.get("/mechanic_dashboard/mcar-details", (req, res) => {
  res.render("mechanic_dashboard/mcar-details.ejs");
});
app.get("/mechanic_dashboard/update-profile", (req, res) => {
  res.render("mechanic_dashboard/update-profile.ejs");
});
app.get("/mechanic_dashboard/update-password", (req, res) => {
  res.render("mechanic_dashboard/update-password.ejs");
});