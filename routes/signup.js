const express = require("express");

module.exports = (supabase) => {

  const router = express.Router();

  router.get("/signup", async (req, res) => {

    res.json({
      message:
        "Signup route working"
    });

  });

  return router;

};
