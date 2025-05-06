const express = require('express');
const router = express.Router()


router.get("/current-tasks", (req, res) => {
    res.render("mechanic_dashboard/current-tasks.ejs");
  });

  module.exports = router;