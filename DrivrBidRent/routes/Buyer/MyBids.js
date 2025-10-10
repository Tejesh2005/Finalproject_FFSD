// routes/Buyer/MyBids.js
const express = require('express');
const router = express.Router();
const { getMyBids } = require('../../controllers/buyerControllers/myBidsController');
const isBuyerLoggedin = require('../../middlewares/isBuyerLoggedin');

router.get('/buyer_dashboard/my-bids', isBuyerLoggedin, getMyBids);

module.exports = router;