// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// LOGOUT: Clear cookie + return redirect
router.get('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict'
  });
  return res.json({
    success: true,
    message: 'Logged out successfully',
    redirectUrl: '/' 
  });
});

module.exports = router;