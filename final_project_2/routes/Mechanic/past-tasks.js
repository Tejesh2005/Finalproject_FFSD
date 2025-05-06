
const express = require('express');
const router = express.Router()



router.get("/past-tasks", (req, res) => {
    res.render("mechanic_dashboard/past-tasks.ejs");
  });

  module.exports = router;