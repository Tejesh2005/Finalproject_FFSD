// Backend/models/Chat.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema({
  type: { 
    type: String, 
    enum: ['rental', 'inspection'], 
    required: true 
  },

  // Participants
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  mechanic: { type: Schema.Types.ObjectId, ref: 'User' },
  auctionManager: { type: Schema.Types.ObjectId, ref: 'User' },

  // References
  rentalRequest: { type: Schema.Types.ObjectId, ref: 'RentalRequest' },
  inspectionTask: { type: Schema.Types.ObjectId, ref: 'AuctionRequest' }, // This is the car being inspected

  // Duration
  expiresAt: { type: Date, required: true }, // Set to approval date + 1 day or fixed 30 days

  // Display
  title: { type: String },
  finalPrice: { type: Number },

  // Metadata
  lastMessage: String,
  lastMessageAt: Date,
  unreadCountBuyer: { type: Number, default: 0 },
  unreadCountSeller: { type: Number, default: 0 },
  unreadCountMechanic: { type: Number, default: 0 },
  unreadCountAuctionManager: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
chatSchema.index({ mechanic: 1, expiresAt: 1 });
chatSchema.index({ auctionManager: 1, expiresAt: 1 });
chatSchema.index({ inspectionTask: 1 });

export default mongoose.model('Chat', chatSchema);