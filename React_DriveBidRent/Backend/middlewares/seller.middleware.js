// middlewares/seller.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sellerMiddleware = async (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      redirectUrl: "/"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
        redirectUrl: "/"
      });
    }

    if (user.userType !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Seller role required.",
        redirectUrl: "/"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      redirectUrl: "/"
    });
  }
};

export default sellerMiddleware;