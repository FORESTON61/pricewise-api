const express = require("express");

module.exports = (
  scraperService,
  cache
) => {

  const router =
    express.Router();

  // =========================
  // HOME
  // =========================

  router.get(
    "/",

    async (req, res) => {

      res.send(
        "PriceWise API running 🚀"
      );

    }
  );

  // =========================
  // TEST
  // =========================

  router.get(
    "/test",

    async (req, res) => {

      res.json({
        status: "ok"
      });

    }
  );

  // =========================
  // PRICE ROUTE
  // =========================

  router.get(
    "/price",

    async (req, res) => {

      try {

        const product =
          req.query.product;

        if (!product) {

          return res.json({
            error:
              "Product query missing"
          });

        }

        const result =
          await scraperService(
            product,
            cache
          );

        res.json(result);

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
