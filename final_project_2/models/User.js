const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ['buyer', 'seller', 'driver', 'mechanic'] },
  dateOfBirth: { type: Date },
  doorNo: { 
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  street: { 
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  city: { 
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  state: { 
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  drivingLicense: { type: String },
  shopName: { type: String },
  photoPath: { type: String },
  repairBikes: { type: Boolean, default: false },
  repairCars: { type: Boolean, default: false },
  repairEVs: { type: Boolean, default: false },
  repairTrucks: { type: Boolean, default: false },
  repairJCBs: { type: Boolean, default: false },
  phone: { 
    type: String, 
    required: true, 
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  notificationPreference: { 
    type: String,
    enum: ['all', 'important', 'none'],
    default: 'all'
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;