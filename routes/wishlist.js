const express = require("express");

module.exports = (
  supabase,
  authMiddleware
) => {

  const router =
    express.Router();

  // =========================
  // GET WISHLIST
  // =========================

  router.get(
    "/wishlist",

    authMiddleware,

    async (req, res) => {

      try {

        const {
          data,
          error
        } =
          await supabase
            .from("wishlist")
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
          wishlist:
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

  // =========================
  // ADD TO WISHLIST
  // =========================

  router.post(
    "/wishlist",

    authMiddleware,

    async (req, res) => {

      try {

        const {
          productSlug
        } = req.body;

        if (!productSlug) {

          return res.json({
            error:
              "Missing productSlug"
          });

        }

        const {
          data,
          error
        } =
          await supabase
            .from("wishlist")
            .insert([
              {
                user_id:
                  req.user.id,

                product_slug:
                  productSlug
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
          item:
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

  return router;

};
