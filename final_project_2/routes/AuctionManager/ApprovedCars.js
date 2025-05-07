const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

router.get('/approvedcars', async (req, res) => {
  try {
    // Fetch all cars with status 'approved' and populate seller info
    const approvedCars = await AuctionRequest.find({ status: 'approved' })
      .populate('sellerId', 'firstName lastName city');
    
    res.render('auctionmanager/approvedcars', { approvedCars });
  } catch (err) {
    console.error('Error fetching approved cars:', err);
    res.render('auctionmanager/approvedcars', { approvedCars: [] });
  }
});

// Add new route to handle starting an auction
router.post('/start-auction/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    
    // Update the started_auction field to 'yes'
    await AuctionRequest.findByIdAndUpdate(carId, { started_auction: 'yes' });
    
    // Redirect back to the approved cars page
    res.redirect('/auctionmanager/approvedcars');
  } catch (err) {
    console.error('Error starting auction:', err);
    res.status(500).json({ error: 'Failed to start auction' });
  }
});

// Add route for viewing bids
router.get('/view-bids/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    // You'll need to implement this view to show bids
    // For now, just redirecting to a placeholder route
    res.redirect(`/auctionmanager/bids/${carId}`);
  } catch (err) {
    console.error('Error viewing bids:', err);
    res.status(500).json({ error: 'Failed to view bids' });
  }
});

module.exports = router;