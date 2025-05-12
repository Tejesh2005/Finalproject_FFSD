const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const RentalRequest = require("./models/RentalRequest");
const AuctionRequest = require("./models/AuctionRequest");

const addAuctionRoute = require("./routes/Seller/AddAuction");
const auctionDetailsRoutes = require("./routes/Seller/AuctionDetail");
const addRentalRoute = require("./routes/Seller/AddRental");
const seller_profileRoute = require("./routes/Seller/profile");
const viewAuctionsRoute = require("./routes/Seller/ViewAuctions.js");
const viewRentalsRoute = require("./routes/Seller/ViewRentals.js");
const viewearningsRoute = require("./routes/Seller/ViewEarnings.js");
const rentalDetailsRoute = require("./routes/Seller/RentalDetails");
const updateRentalRoute = require('./routes/Seller/UpdateRental');

const AuctionManagerHomeRoute = require("./routes/AuctionManager/Home.js");
const Auctionrequests = require("./routes/AuctionManager/Requests.js");
const AssignMechanic = require("./routes/AuctionManager/AssignMechanic.js");
const Pendingcars = require("./routes/AuctionManager/Pending.js");
const approvedCars = require("./routes/AuctionManager/ApprovedCars.js");
const PendingCarDetails = require("./routes/AuctionManager/PendingCarDetails.js");

const AdminHomepage = require("./routes/Admin/AdminHome.js");
const ManageUsers = require("./routes/Admin/ManageUSers.js");
const adminProfile = require("./routes/Admin/AdminProfile.js");
const Analytics = require("./routes/Admin/Analytics.js");
const ManageEarnings = require("./routes/Admin/ManageEarnings.js");

const Aboutus = require("./routes/Buyer/Aboutus.js");

const BuyerDashboardRoute = require("./routes/Buyer/BuyerDashboard.js");
const BuyerAuctionRoute = require("./routes/Buyer/Auction.js");
const BuyerDriverRoute = require("./routes/Buyer/Driver.js");
const BuyerRentalRoute = require("./routes/Buyer/Rental.js");
const BuyerPurchaseRoute = require("./routes/Buyer/Purchase.js");
const BuyerWishlistRoute = require("./routes/Buyer/Wishlist.js");

const app = express();

const DriverDashboard = require("./routes/Driver/Dashboard.js");

const index = require("./routes/Mechanic/index.js");
const currentTasks = require("./routes/Mechanic/current-tasks.js"); 
const pendingTasks = require("./routes/Mechanic/pending-tasks.js");
const pastTasks = require("./routes/Mechanic/past-tasks.js");   
const profile = require("./routes/Mechanic/profile.js");
const mcardetails = require("./routes/Mechanic/mcardetails.js")

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

const isAuctionManager = (req, res, next) => {
  if (req.session.userId && req.session.userType === 'auction_manager') {
    return next();
  }
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  return res.status(403).send('Access denied. This area is only for auction managers.');
};

mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://Jeevan:Bunny123@cluster0.2jrrwqn.mongodb.net/DriveBidRent")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  try {
    const topRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(4);

    const topAuctions = await AuctionRequest.find({ started_auction: 'yes'})
      .sort({ auctionDate: -1 })
      .limit(4);

    res.render("homepage.ejs", { topRentals, topAuctions });
  } catch (err) {
    console.error("Error fetching top rentals and auctions:", err);
    res.render("homepage.ejs", { topRentals: [], topAuctions: [], error: "Failed to load top rentals and auctions" });
  }
});

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
    
    const googleAddressLink = userType === 'mechanic' ? req.body.googleAddressLink : undefined;

    console.log("doorNo received:", req.body.doorNo);
    console.log("street received:", req.body.street);
    console.log("city received:", req.body.city);
    console.log("state received:", req.body.state);

    let doorNo, street, city, state;
    
    if (req.body.doorNo) {
      doorNo = Array.isArray(req.body.doorNo) 
        ? req.body.doorNo.find(val => val && val.trim() !== '') 
        : req.body.doorNo;
    }
    
    if (req.body.street) {
      street = Array.isArray(req.body.street) 
        ? req.body.street.find(val => val && val.trim() !== '') 
        : req.body.street;
    }
    
    if (req.body.city) {
      city = Array.isArray(req.body.city) 
        ? req.body.city.find(val => val && val.trim() !== '') 
        : req.body.city;
    }
    
    if (req.body.state) {
      state = Array.isArray(req.body.state) 
        ? req.body.state.find(val => val && val.trim() !== '') 
        : req.body.state;
    }
    
    const repairBikes = req.body.repairBikes === "on";
    const repairCars = req.body.repairCars === "on";

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

    const parsedExperienceYears = experienceYears ? parseInt(experienceYears) : undefined;

    const userData = {
      firstName,
      lastName,
      email,
      password,
      userType,
      dateOfBirth,
      phone,
      experienceYears: parsedExperienceYears,
      approved_status: approved_status || 'No',
      repairBikes,
      repairCars
    };
    
    if (doorNo) userData.doorNo = doorNo;
    if (street) userData.street = street;
    if (city) userData.city = city;
    if (state) userData.state = state;
    if (drivingLicense) userData.drivingLicense = drivingLicense;
    if (shopName) userData.shopName = shopName;
    if (googleAddressLink) userData.googleAddressLink = googleAddressLink;
    
    console.log("Final userData being saved:", userData);
    
    const user = new User(userData);
    await user.save();
    
    res.redirect("/login");
  } catch (err) {
    console.error("Error in signup process:", err);
    res.render("signup", {
      error: "An error occurred during signup: " + err.message,
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
    else if (req.session.userType === "auction_manager") {
      res.redirect("/auctionmanager/home1");
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

app.use("/", BuyerDashboardRoute);
app.use("/", BuyerAuctionRoute);
app.use("/", BuyerDriverRoute);
app.use("/", BuyerRentalRoute);
app.use("/", BuyerPurchaseRoute);
app.use("/", BuyerWishlistRoute);
app.use("/", Aboutus);

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

app.use("/seller_dashboard", addAuctionRoute);
app.use("/seller_dashboard", auctionDetailsRoutes);
app.use("/seller_dashboard", addRentalRoute);
app.use("/seller_dashboard", seller_profileRoute);
app.use("/seller_dashboard", viewAuctionsRoute);
app.use("/seller_dashboard", viewRentalsRoute);
app.use("/seller_dashboard", viewearningsRoute);
app.use("/seller_dashboard", rentalDetailsRoute);
app.use('/seller_dashboard', updateRentalRoute);

app.get("/seller_dashboard/update-rental", async (req, res) => {
  if (!req.session.userId || req.session.userType !== "seller") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    const rentalId = req.query.id;
    if (!rentalId) {
      return res.redirect("/seller_dashboard/view-rentals");
    }

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

    const auctionId = req.query.id;
    if (!auctionId) {
      return res.redirect("/seller_dashboard/view-auctions");
    }

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

app.use("/auctionmanager", isAuctionManager, AuctionManagerHomeRoute);
app.use("/auctionmanager", isAuctionManager, Auctionrequests);
app.use("/auctionmanager", isAuctionManager, AssignMechanic);
app.use("/auctionmanager", isAuctionManager, Pendingcars);
app.use("/auctionmanager", isAuctionManager, approvedCars);
app.use("/auctionmanager", isAuctionManager, PendingCarDetails);

app.use("/", AdminHomepage);
app.use("/", ManageUsers);
app.use("/", adminProfile);
app.use("/", Analytics);
app.use("/", ManageEarnings);

app.use("/mechanic_dashboard", currentTasks);
app.use("/mechanic_dashboard", pendingTasks);
app.use("/mechanic_dashboard", pastTasks);
app.use("/mechanic_dashboard", profile);
app.use("/mechanic_dashboard", index);
app.use("/mechanic_dashboard", mcardetails);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;