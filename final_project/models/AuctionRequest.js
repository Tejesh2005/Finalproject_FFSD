const mongoose = require('mongoose');

const auctionRequestSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true },
  vehicleImage: { 
    type: String, 
    required: true,
    
  },
  year: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  mileage: { 
    type: Number, 
    required: true,
    min: 0
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['excellent', 'good', 'fair'],
    lowercase: true
  },
  auctionDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Auction date must be in the future'
    }
  },
  startingBid: { 
    type: Number, 
    required: true,
    min: 0
  },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuctionRequest', auctionRequestSchema);