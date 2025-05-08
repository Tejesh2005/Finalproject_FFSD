const express = require('express');
const router = express.Router();
const RentalRequest = require('../../models/RentalRequest');
const RentalCost = require('../../models/RentalCost');

// Rental details route
router.get('/rental', (req, res) => {
  const id = req.query.id;
  console.log('GET /rental - Redirecting to buyer_dashboard with id:', id);
  res.redirect(`/buyer_dashboard?page=rental&id=${id}`);
});

// Rentals list route
router.get('/rentals', (req, res) => {
  console.log('GET /rentals - Redirecting to buyer_dashboard rentals page');
  res.redirect('/buyer_dashboard?page=rentals');
});

// Save rental dates in RentalRequest and cost in RentalCost
router.post('/rental', async (req, res) => {
  try {
    console.log('POST /rental - Received request:', req.body);

    const { rentalCarId, buyerId, sellerId, pickupDate, dropDate, totalCost, includeDriver } = req.body;

    // Validate required fields
    if (!rentalCarId || !buyerId || !sellerId || !pickupDate || !dropDate || !totalCost) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Verify the rental request exists
    const rentalRequest = await RentalRequest.findById(rentalCarId);
    if (!rentalRequest) {
      console.log('Rental request not found for id:', rentalCarId);
      return res.status(404).json({ success: false, error: 'Rental request not found' });
    }

    // Update RentalRequest with dates, buyerId, and status
    console.log('Updating RentalRequest with:', { buyerId, pickupDate, dropDate, includeDriver });
    const updatedRentalRequest = await RentalRequest.findByIdAndUpdate(
      rentalCarId,
      {
        buyerId,
        pickupDate,
        dropDate,
        includeDriver: includeDriver || false, // Set default value if not provided
        status: 'unavailable'
      },
      { new: true }
    );
    console.log('Updated RentalRequest:', updatedRentalRequest);

    // Create a new RentalCost entry
    console.log('Creating RentalCost with:', { rentalCarId, buyerId, sellerId, totalCost, includeDriver });
    const rentalCost = new RentalCost({
      rentalCarId,
      buyerId,
      sellerId,
      totalCost,
      includeDriver: includeDriver || false // Set default value if not provided
    });

    const savedRentalCost = await rentalCost.save();
    console.log('Saved RentalCost:', savedRentalCost);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /rental:', err);
    res.status(500).json({ success: false, error: 'Failed to save rental details: ' + err.message });
  }
});

module.exports = router;