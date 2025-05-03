const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');

// GET route for the auction manager home page
router.get('/home1', async (req, res) => {
    try {
        // Fetch all pending auction requests
        const auctionReqPend = await AuctionRequest.find({ status: 'pending' })
            .populate('sellerId')
            .sort({ createdAt: -1 }); // Sort by creation date, newest first
        
        console.log('Auction Requests:', auctionReqPend);
        res.render('auctionmanager/home1.ejs', { auctionReqPend: auctionReqPend });
    } catch(err) {
        console.error('Error fetching auction requests:', err);
        res.render('auctionmanager/home1.ejs', { 
            auctionReqPend: [], 
            error: 'Failed to load auction requests' 
        });
    }
});

// GET route for the requests page (showing all pending requests)
router.get('/requests', async (req, res) => {
    try {
        // Fetch all pending auction requests
        const auctionReqPend = await AuctionRequest.find({ status: 'pending' })
            .populate('sellerId')
            .sort({ createdAt: -1 });
        
        res.render('auctionmanager/requests.ejs', { auctionReqPend: auctionReqPend });
    } catch(err) {
        console.error('Error fetching auction requests:', err);
        res.render('auctionmanager/requests.ejs', { 
            auctionReqPend: [], 
            error: 'Failed to load auction requests' 
        });
    }
});

module.exports = router;