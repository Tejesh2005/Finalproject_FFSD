const express = require('express');
const router = express.Router()


router.get('/admin', async (req, res) => {

    res.render('admin_dashboard/admin.ejs');
    // if (!req.session.userId || req.session.userType !== 'admin') {
    //   return res.redirect('/login');
    // }
    
    // try {
    //   const user = await User.findById(req.session.userId);
    //   res.render('admin_dashboard/admin.ejs', { user });
    // } catch (err) {
    //   console.error(err);
    //   res.render('admin_dashboard/admin.ejs', { user: {} });
    // }
  });

  module.exports = router;