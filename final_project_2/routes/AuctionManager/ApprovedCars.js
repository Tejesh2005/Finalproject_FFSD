const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest'); // Make sure to require your model

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

module.exports = router;