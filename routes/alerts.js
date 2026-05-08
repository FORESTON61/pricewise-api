const express = require("express");

module.exports = (
  supabase,
  authMiddleware
) => {

  const router =
    express.Router();

  // =========================
  // CREATE ALERT
  // =========================

  router.get(
    "/create-alert",

    authMiddleware,

    async (req, res) => {

      try {

        const product =
          req.query.product;

        const targetPrice =
          parseInt(req.query.price);

        if (
          !product ||
          !targetPrice
        ) {

          return res.json({
            error:
              "Missing product or price"
          });

        }

        const productSlug =
          product
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const { error } =
          await supabase
            .from("alerts")
            .insert([
              {
                user_id:
                  req.user.id,

                product_slug:
                  productSlug,

                target_price:
                  targetPrice
              }
            ]);

        if (error) {

          return res.json({
            error:
              error.message
          });

        }

        res.json({

          success: true,

          message:
            "Alert created successfully",

          userId:
            req.user.id,

          productSlug,

          targetPrice

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
