const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Get pending mechanics
router.get('/manage-user', async (req, res) => {
  try {
    const pendingMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'No'
    }).lean();
    
    res.render('admin_dashboard/manage-user.ejs', { 
      users: pendingMechanics
    });
  } catch (error) {
    console.error('Error fetching pending mechanics:', error);
    res.status(500).render('error', { 
      message: 'Server error occurred while fetching pending mechanics' 
    });
  }
});

// Approve mechanic
router.post('/approve-user/:id', async (req, res) => {
  console.log('User ID:', req.params.id); // Log the user ID for debugging
  try {
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
        message: 'Mechanic not found or already approved' 
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
      message: 'Error approving mechanic' + error.message 
    });
  }
});

// Decline mechanic
router.post('/decline-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const deletedUser = await User.findOneAndDelete({ 
      _id: userId, 
      userType: 'mechanic' 
    });
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mechanic not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Mechanic declined and removed successfully' 
    });
  } catch (error) {
    console.error('Error declining mechanic:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error declining mechanic' 
    });
  }
});

module.exports = router;