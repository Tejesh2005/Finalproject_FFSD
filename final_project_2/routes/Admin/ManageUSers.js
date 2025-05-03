const express = require('express');
const router = express.Router()


router.get('/manage-user',(req,res)=>{
    res.render('admin_dashboard/manage-user.ejs');
  });

  module.exports=router;