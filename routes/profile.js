const express = require("express");

module.exports = (
  authMiddleware
) => {

  const router =
    express.Router();

  // =========================
  // PROFILE
  // =========================

  router.get(
    "/profile",

    authMiddleware,

    async (req, res) => {

      try {

        res.json({

          success: true,

          message:
            "Protected profile route working",

          user:
            req.user

        });

      } catch (error) {

        res.json({
          error:
            error.message
        });

      }

    }
  );

  return router;

};
