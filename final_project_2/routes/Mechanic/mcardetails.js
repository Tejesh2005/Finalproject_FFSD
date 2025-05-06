const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');


router.get("/mcar-details", (req, res) => {
    res.render("mechanic_dashboard/mcar-details.ejs");
  });


  module.exports = router;