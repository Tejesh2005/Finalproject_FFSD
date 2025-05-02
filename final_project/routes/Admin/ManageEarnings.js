const express = require('express');
const router = express.Router();


router.get('/manage-earnings',(req,res)=>{
    res.render('admin_dashboard/manage-earnings.ejs');
  });

  module.exports=router;