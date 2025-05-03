const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

router.get('/requests', async (req, res) => {
    try {
        const auctionReqPend = await AuctionRequest.find({ status: 'pending' }).populate('sellerId');
        res.render('auctionmanager/requests.ejs', { auctionReqPend: auctionReqPend });
    } catch(err) {
        console.error('Error fetching user data:', err);
        res.render('auctionmanager/requests.ejs', { auctionReqPend: [], error: 'Failed to load user data' });
    }
});

module.exports = router;