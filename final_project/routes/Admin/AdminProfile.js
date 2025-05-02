const express = require('express');
const router = express.Router();


router.get('/admin-profile',(req,res)=>{
    res.render('admin_dashboard/admin-profile.ejs');
  });

  module.exports=router;