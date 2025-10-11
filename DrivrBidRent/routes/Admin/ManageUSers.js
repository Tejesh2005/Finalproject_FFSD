const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const isAdminLoggedIn = require('../../middlewares/isAdminLoggedin');

// Get pending mechanics, approved mechanics, buyers, and sellers
router.get('/manage-user', isAdminLoggedIn, async (req, res) => {
  try {
    // Verify admin user exists
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.redirect('/login');
    }

    const pendingMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'No'
    }).lean();

    const approvedMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'Yes'
    }).lean();

    const buyers = await User.find({ 
      userType: 'buyer'
    }).lean();

    const sellers = await User.find({ 
      userType: 'seller'
    }).lean();
    
    res.render('admin_dashboard/manage-user.ejs', { 
      users: pendingMechanics,
      mechanics: approvedMechanics,
      buyers: buyers,
      sellers: sellers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', { 
      message: 'Server error occurred while fetching users' 
    });
  }
});

// Approve mechanic
router.post('/approve-user/:id', isAdminLoggedIn, async (req, res) => {
  try {
    console.log('Approve request received for user:', req.params.id);
    
    // Verify admin user exists
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const userId = req.params.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { approved_status: 'Yes' } },
      { new: true }
    );
    
    console.log('Updated User:', updatedUser);
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mechanic not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Mechanic approved successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error approving mechanic:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving mechanic: ' + error.message 
    });
  }
});

// Decline mechanic (also used for deleting approved mechanics)
router.post('/decline-user/:id', isAdminLoggedIn, async (req, res) => {
  try {
    console.log('Decline/Delete request received for user:', req.params.id);
    
    // Verify admin user exists
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const userId = req.params.id;
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user: ' + error.message 
    });
  }
});

// Delete buyer
router.post('/delete-buyer/:id', isAdminLoggedIn, async (req, res) => {
  try {
    console.log('Delete buyer request received for user:', req.params.id);
    
    // Verify admin user exists
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const userId = req.params.id;
    
    const deletedUser = await User.findOneAndDelete({ 
      _id: userId, 
      userType: 'buyer' 
    });
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Buyer not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Buyer deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting buyer: ' + error.message 
    });
  }
});

// Delete seller
router.post('/delete-seller/:id', isAdminLoggedIn, async (req, res) => {
  try {
    console.log('Delete seller request received for user:', req.params.id);
    
    // Verify admin user exists
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const userId = req.params.id;
    
    const deletedUser = await User.findOneAndDelete({ 
      _id: userId, 
      userType: 'seller' 
    });
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Seller deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting seller: ' + error.message 
    });
  }
});

module.exports = router;