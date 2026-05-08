const express = require("express");

module.exports = (supabase) => {

  const router = express.Router();

  router.get("/login", async (req, res) => {

    res.json({
      message:
        "Login route working"
    });

  });

  return router;

};
