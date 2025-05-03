const mongoose = require('mongoose');

const RentalRequestSchema = new mongoose.Schema({
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
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    required: true
  },
  costPerKm: {
    type: Number,
    required: true
  },
  driverAvailable: {
    type: Boolean,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RentalRequest', RentalRequestSchema);