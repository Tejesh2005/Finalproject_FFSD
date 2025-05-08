const mongoose = require('mongoose');

const auctionCostSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  convenienceFee: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});

const AuctionCost = mongoose.model('AuctionCost', auctionCostSchema);

module.exports = AuctionCost;