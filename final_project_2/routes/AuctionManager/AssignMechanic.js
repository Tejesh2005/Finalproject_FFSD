const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

router.get('/assign-mechanic/:id', async (req, res) => {
    try {
        const request = await AuctionRequest.findById(req.params.id).populate('sellerId');
        if (!request) {
            return res.status(404).send('Request not found');
        }
        res.render('auctionmanager/assign-mechanic.ejs', { request: request });
    } catch(err) {
        console.error('Error fetching request details:', err);
        res.status(500).send('Error loading request details');
    }
});

module.exports = router;