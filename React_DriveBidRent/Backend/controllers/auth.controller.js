// Backend/controllers/auth.controller.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const authController = {
  signup: async (req, res) => {
    try {
      // console.log('Signup route called with body keys:', Object.keys(req.body));
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
        approved_status,
      } = req.body;

      console.log(req.body);
      const googleAddressLink =
        userType === "mechanic" ? req.body.googleAddressLink : undefined;

      // normalize address fields from req.body (avoid using browser globals like `window` on server)
      let doorNo = "", street = "", city = "", state = "";
      ["doorNo", "street", "city", "state"].forEach((field) => {
        const val = req.body[field];
        const normalized = Array.isArray(val)
          ? val.find((v) => v?.trim()) || ""
          : val || "";
        if (field === "doorNo") doorNo = normalized;
        if (field === "street") street = normalized;
        if (field === "city") city = normalized;
        if (field === "state") state = normalized;
      });

      const repairBikes =
        req.body.repairBikes === "on" || req.body.repairBikes === true;
      const repairCars =
        req.body.repairCars === "on" || req.body.repairCars === true;

      // === VALIDATIONS ===
      // Basic required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Validate userType
      const allowedTypes = ['buyer', 'seller', 'driver', 'mechanic', 'admin', 'auction_manager'];
      if (!userType || !allowedTypes.includes(userType)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing userType' });
      }
      if (!phone || !/^\d{10}$/.test(phone)) {
        return res
          .status(400)
          .json({ success: false, message: "Phone number must be 10 digits" });
      }

      if (!dateOfBirth) {
        return res.status(400).json({ success: false, message: 'Date of birth is required' });
      }

      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid dateOfBirth' });
      }

      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        return res
          .status(400)
          .json({
            success: false,
            message: "You must be at least 18 years old",
          });
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 8 characters",
          });
      }

      if (!termsAccepted) {
        return res
          .status(400)
          .json({ success: false, message: "You must accept terms" });
      }

      if (await User.findOne({ $or: [{ email }, { phone }] })) {
        return res
          .status(409)
          .json({ success: false, message: "Email or phone already exists" });
      }

      const userData = {
        firstName,
        lastName,
        email,
        password,
        userType,
        dateOfBirth,
        phone,
        experienceYears: experienceYears
          ? parseInt(experienceYears)
          : undefined,
        approved_status: approved_status || "No",
        repairBikes,
        repairCars,
      };

      // attach optional fields if provided
      const collected = {
        doorNo,
        street,
        city,
        state,
        drivingLicense: drivingLicense || req.body.drivingLicense || "",
        shopName: shopName || req.body.shopName || "",
        googleAddressLink: googleAddressLink || req.body.googleAddressLink || "",
      };

      Object.keys(collected).forEach((field) => {
        if (collected[field]) userData[field] = collected[field];
      });

      const user = new User(userData);
      try {
        await user.save();
      } catch (saveErr) {
        console.error('User save error:', saveErr);
        // Convert mongoose validation errors to client-friendly messages
        if (saveErr.name === 'ValidationError') {
          const messages = Object.values(saveErr.errors).map(e => e.message).join('; ');
          return res.status(400).json({ success: false, message: messages });
        }
        throw saveErr;
      }

      return res.status(201).json({
        success: true,
        message: "Account created! Redirecting...",
        data: { userId: user._id, userType: user.userType },
      });
    } catch (err) {
      console.error("Signup error:", err);
      const message =
        err.code === 11000 ? "User already exists" : "Signup failed";
      return res
        .status(err.code === 11000 ? 409 : 500)
        .json({ success: false, message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const token = generateToken(user);
      res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });

      // FIXED: Correct redirect paths
      const redirectMap = {
        buyer: "/buyer-dashboard",
        seller: "/seller",
        driver: "/driver-dashboard",
        mechanic: "/mechanic/dashboard",
        admin: "/admin/dashboard",
        auction_manager: "/auction-manager", // CORRECT
      };

      const redirectUrl = redirectMap[user.userType] || "/";

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            approved_status: user.approved_status,
          },
          redirectUrl,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  },

  logout: async (req, res) => {
    res.clearCookie("jwt");
    return res.json({ success: true, message: "Logged out" });
  },
};

module.exports = authController;
