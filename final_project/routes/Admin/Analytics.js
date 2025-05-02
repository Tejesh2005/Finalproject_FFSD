const express = require('express');
const router = express.Router();

router.get('/analytics',(req,res)=>{
    res.render('admin_dashboard/analytics.ejs');
  });

  module.exports=router;