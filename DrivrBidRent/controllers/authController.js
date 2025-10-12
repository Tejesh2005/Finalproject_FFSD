const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const authController = {
  getSignup: (req, res) => {
    res.render("signup", { title: "Sign Up" });
  },

  postSignup: async (req, res) => {
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

      // Check if request is JSON (from fetch API)
      const isJsonRequest = req.headers['content-type'] === 'application/json';

      // Validation checks
      if (!phone || !phone.match(/^\d{10}$/)) {
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            message: "Phone number must be 10 digits"
          });
        }
        return res.render("signup", {
          error: "Phone number must be 10 digits",
          formData: req.body,
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
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            message: "You must be at least 18 years old to sign up"
          });
        }
        return res.render("signup", {
          error: "You must be at least 18 years old to sign up",
          formData: req.body,
        });
      }

      if (password !== confirmPassword) {
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            message: "Passwords do not match"
          });
        }
        return res.render("signup", {
          error: "Passwords do not match",
          formData: req.body,
        });
      }

      if (password.length < 8) {
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
          });
        }
        return res.render("signup", {
          error: "Password must be at least 8 characters long",
          formData: req.body,
        });
      }

      if (!termsAccepted) {
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            message: "You must accept the terms and conditions"
          });
        }
        return res.render("signup", {
          error: "You must accept the terms and conditions",
          formData: req.body,
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (isJsonRequest) {
          return res.status(409).json({
            success: false,
            message: "Email already exists"
          });
        }
        return res.render("signup", {
          error: "Email already exists",
          formData: req.body,
        });
      }

      // Check for existing phone number
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        if (isJsonRequest) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists"
          });
        }
        return res.render("signup", {
          error: "Phone number already exists",
          formData: req.body,
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
      
      const user = new User(userData);
      await user.save();

      // Return 201 Created for JSON requests
      if (isJsonRequest) {
        return res.status(201).json({
          success: true,
          message: "Account created successfully! Redirecting to login...",
          userId: user._id,
          userType: user.userType,
          redirectUrl: "/login"
        });
      }
      
      // Keep original redirect for form submissions
      res.redirect("/login");
    } catch (err) {
      console.error("Error in signup process:", err);
      
      // Check if request is JSON
      const isJsonRequest = req.headers['content-type'] === 'application/json';
      
      if (isJsonRequest) {
        let errorMessage = "An error occurred during signup";
        
        // Handle specific error types
        if (err.name === 'ValidationError') {
          errorMessage = "Validation failed: " + Object.values(err.errors).map(e => e.message).join(', ');
          return res.status(400).json({
            success: false,
            message: errorMessage
          });
        }
        
        if (err.code === 11000) {
          errorMessage = "User already exists with this email or phone number";
          return res.status(409).json({
            success: false,
            message: errorMessage
          });
        }
        
        return res.status(500).json({
          success: false,
          message: errorMessage
        });
      }
      
      // Original error handling for form submissions
      res.render("signup", {
        error: "An error occurred during signup: " + err.message,
        formData: req.body,
      });
    }
  },

  getLogin: (req, res) => {
    res.render("login", { title: "Login" });
  },

  postLogin: async (req, res) => {
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

      const token = generateToken(user);
      res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      switch (user.userType) {
        case "buyer":
          res.redirect("/buyer_dashboard?page=dashboard");
          break;
        case "seller":
          res.redirect("/seller_dashboard/seller");
          break;
        case "driver":
          res.redirect("/driver_dashboard/driverdashboard");
          break;
        case "mechanic":
          res.redirect("/mechanic_dashboard/index");
          break;
        case "admin":
          res.redirect("/admin/admin");
          break;
        case "auction_manager":
          res.redirect("/auctionmanager/home1");
          break;
        default:
          res.redirect("/");
      }
    } catch (err) {
      console.error(err);
      res.render("login", { error: "An error occurred during login" });
    }
  }
};

module.exports = authController;