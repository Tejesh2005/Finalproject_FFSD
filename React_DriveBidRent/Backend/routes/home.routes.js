const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// GET /api/home/data
router.get('/data', homeController.getHomeData);

module.exports = router;