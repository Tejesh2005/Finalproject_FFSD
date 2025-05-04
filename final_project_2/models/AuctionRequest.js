const mongoose = require('mongoose');

const auctionRequestSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true
  },
  vehicleImage: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    required: true
  },
  auctionDate: {
    type: Date,
    required: true
  },
  startingBid: {
    type: Number,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'assignedMechanic', 'rejected'],
    default: 'pending'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const AuctionRequest = mongoose.model('AuctionRequest', auctionRequestSchema);

module.exports = AuctionRequest;