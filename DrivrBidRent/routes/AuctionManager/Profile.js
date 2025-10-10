const express = require('express');
const router = express.Router();
const isAuctionManager = require('../../middlewares/isAuctionManager');

router.get("/profile",isAuctionManager,async(req,res)=>{
    const user=req.user;
    res.render("./auctionmanager/managerprofile",{user});

})

module.exports=router;