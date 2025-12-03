import User from '../../models/User.js';

const getManageUsers = async (req, res) => {
  try {
    const pendingMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'No'
    }).lean();

    const approvedMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'Yes'
    }).lean();

    const buyers = await User.find({ userType: 'buyer' }).lean();
    const sellers = await User.find({ userType: 'seller' }).lean();
    
    // Get reported users (buyers who failed to complete payment) - exclude blocked users
    const reportedUsers = await User.find({ 
      isReported: true,
      isBlocked: { $ne: true }
    }).lean();

    // Get blocked users (all user types)
    const blockedUsers = await User.find({ 
      isBlocked: true 
    }).lean();

    res.json({
      success: true,
      message: "Users fetched successfully",
      data: { pendingMechanics, approvedMechanics, buyers, sellers, reportedUsers, blockedUsers }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching users",
      data: null
    });
  }
};

const approveMechanic = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { approved_status: 'Yes' } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    res.json({ success: true, message: 'Mechanic approved successfully', data: updatedUser });
  } catch (error) {
    console.error('Error approving mechanic:', error);
    res.status(500).json({ success: false, message: 'Error approving mechanic: ' + error.message });
  }
};

const declineUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user: ' + error.message });
  }
};

const deleteBuyer = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id, userType: 'buyer' });
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Buyer not found' });
    res.json({ success: true, message: 'Buyer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting buyer: ' + error.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id, userType: 'seller' });
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting seller: ' + error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    user.blockedAt = user.isBlocked ? new Date() : null;
    await user.save();

    // If user is being blocked, remove their current bids from ongoing auctions
    if (user.isBlocked) {
      const AuctionBid = (await import('../../models/AuctionBid.js')).default;
      const AuctionRequest = (await import('../../models/AuctionRequest.js')).default;

      // Find all auctions where this user has any bids
      const userBids = await AuctionBid.find({ 
        buyerId: userId
      });

      // Group bids by auction
      const auctionIds = [...new Set(userBids.map(b => b.auctionId.toString()))];

      for (const auctionId of auctionIds) {
        const auction = await AuctionRequest.findById(auctionId);
        
        // Only process ongoing auctions (not ended/stopped)
        if (auction && auction.started_auction === 'yes' && !auction.auction_stopped) {
          // First, set all bids for this auction to not current
          await AuctionBid.updateMany(
            { auctionId: auctionId },
            { $set: { isCurrentBid: false } }
          );

          // Delete ALL bids from the blocked user for this auction
          await AuctionBid.deleteMany({
            auctionId: auctionId,
            buyerId: userId
          });

          // Find the new highest bid from remaining bidders
          const highestBid = await AuctionBid.findOne({
            auctionId: auctionId
          })
          .sort({ bidAmount: -1, bidTime: -1 })
          .exec();

          // Set the new highest bid as current
          if (highestBid) {
            highestBid.isCurrentBid = true;
            await highestBid.save();
          }
        }
      }
    }

    const message = user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    res.json({ success: true, message, data: { isBlocked: user.isBlocked } });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.status(500).json({ success: false, message: 'Error updating user status: ' + error.message });
  }
};

export default { getManageUsers, approveMechanic, declineUser, deleteBuyer, deleteSeller, blockUser };