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

    res.json({
      success: true,
      message: "Users fetched successfully",
      data: { pendingMechanics, approvedMechanics, buyers, sellers }
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

export default { getManageUsers, approveMechanic, declineUser, deleteBuyer, deleteSeller };