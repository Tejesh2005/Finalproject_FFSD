const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

// Display pending cars
router.get('/pending', async (req, res) => {
  try {
    const pendingCars = await AuctionRequest.find({ 
      status: 'assignedMechanic' 
    }).populate('sellerId');
    
    res.render('auctionmanager/pending', { pendingCars });
  } catch (err) {
    console.error(err);
    res.render('auctionmanager/pending', { pendingCars: [] });
  }
});

// Get review data for modal
router.get('/get-review/:id', async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');
    
    if (!car.mechanicReview) {
      return res.json({});
    }

    res.json({
      ...car.mechanicReview,
      mechanicName: car.assignedMechanic ? 
        `${car.assignedMechanic.firstName} ${car.assignedMechanic.lastName}` : 
        'Unknown Mechanic'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching review' });
  }
});

// Update car status
router.post('/update-status/:id',  async (req, res) => {
  try {
    const { status } = req.body;
    const car = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating car status:', err);
    res.status(500).json({ error: 'Failed to update car status' });
  }
});

module.exports = router;