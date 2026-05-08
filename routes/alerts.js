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

  router.post(
    "/alerts",

    authMiddleware,

    async (req, res) => {

      try {

        const {
          productSlug,
          targetPrice
        } = req.body;

        if (
          !productSlug ||
          !targetPrice
        ) {

          return res.json({
            error:
              "Missing productSlug or targetPrice"
          });

        }

        const {
          data,
          error
        } =
          await supabase
            .from("alerts")
            .insert([
              {
                user_id:
                  req.user.id,

                product_slug:
                  productSlug,

                target_price:
                  targetPrice,

                is_active:
                  true
              }
            ])
            .select();

        if (error) {

          return res.json({
            error:
              error.message
          });

        }

        res.json({
          success: true,
          alert:
            data[0]
        });

      } catch (error) {

        res.json({
          error:
            error.message
        });

      }

    }
  );

  // =========================
  // GET USER ALERTS
  // =========================

  router.get(
    "/alerts",

    authMiddleware,

    async (req, res) => {

      try {

        const {
          data,
          error
        } =
          await supabase
            .from("alerts")
            .select("*")
            .eq(
              "user_id",
              req.user.id
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            );

        if (error) {

          return res.json({
            error:
              error.message
          });

        }

        res.json({
          success: true,
          alerts:
            data
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
