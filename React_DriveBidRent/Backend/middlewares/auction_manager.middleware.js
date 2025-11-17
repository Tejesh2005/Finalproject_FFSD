// middlewares/auction_manager.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auctionManagerMiddleware = async (req, res, next) => {
  let token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user || 
          req.user.userType !== "auction_manager" || 
          decoded.userType !== "auction_manager" || 
          decoded.email !== req.user.email) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Auction Manager authentication required.'
        });
      }
      next();
    } catch (error) {
      console.error('Error in auction_manager.middleware:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login.'
    });
  }
};

export default auctionManagerMiddleware;