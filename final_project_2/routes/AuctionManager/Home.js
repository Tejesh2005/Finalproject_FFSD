const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest'); // Make sure you have a AuctionRequest model

router.get('/home1', async (req, res) => {
    try{
       const auctionReqPend= await AuctionRequest.find({status: 'pending'}).populate('sellerId');
       console.log('Auction Requests:', auctionReqPend); // Log the auction requests for debugging
       res.render('auctionmanager/home1.ejs',{ auctionReqPend: auctionReqPend });
    }catch(err){
        console.error('Error fetching user data:', err);
        res.render('auctionmanager/home1.ejs', { user: {}, error: 'Failed to load user data' });
    }
   
  });

module.exports = router;