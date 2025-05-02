const express = require('express');
const router = express.Router();

router.get('/home1', async (req, res) => {
    res.render('auctionmanager/home1.ejs');
  });

module.exports = router;