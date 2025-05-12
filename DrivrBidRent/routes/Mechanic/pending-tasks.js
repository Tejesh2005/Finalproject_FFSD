const express = require('express');
const router = express.Router()

router.get("/pending-tasks", (req, res) => {
    res.render("mechanic_dashboard/pending-tasks.ejs");
  });

  module.exports = router;