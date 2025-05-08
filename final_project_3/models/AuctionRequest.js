const mongoose = require('mongoose');

const auctionRequestSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true },
  vehicleImage: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  condition: { type: String, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  startingBid: { type: Number, required: true },
  auctionDate: { type: Date, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedMechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  started_auction: { type: String, default: 'no', enum: ['no', 'yes', 'ended'] },
  auction_stopped: { type: Boolean, default: false }, // New field
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalPurchasePrice: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('AuctionRequest', auctionRequestSchema);