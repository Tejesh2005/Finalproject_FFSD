// server/controllers/sellerControllers/addAuction.controller.js
const AuctionRequest = require('../../models/AuctionRequest');

const postAddAuction = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image required' });
  }

  try {
    const auction = new AuctionRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: req.file.path,
      year: req.body['vehicle-year'],
      mileage: req.body['vehicle-mileage'],
      fuelType: req.body['fuel-type'],
      transmission: req.body['transmission'],
      condition: req.body['vehicle-condition'],
      auctionDate: req.body['auction-date'],
      startingBid: req.body['starting-bid'],
      sellerId: req.user._id,
      status: 'pending',
    });

    await auction.save();
    res.json({ success: true, message: 'Auction created', data: auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { postAddAuction };