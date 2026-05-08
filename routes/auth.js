const express = require("express");

module.exports = (
  supabase
) => {

  const router =
    express.Router();

  // =========================
  // SIGNUP
  // =========================

  router.post(
    "/signup",

    async (req, res) => {

      try {

        const {
          email,
          password
        } = req.body;

        if (
          !email ||
          !password
        ) {

          return res.json({
            error:
              "Email and password required"
          });

        }

        const {
          data,
          error
        } =
          await supabase.auth.signUp({
            email,
            password
          });

        if (error) {

          return res.json({
            error:
              error.message
          });

        }

        res.json({
          success: true,
          user: data.user
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
  // LOGIN
  // =========================

  router.post(
    "/login",

    async (req, res) => {

      try {

        const {
          email,
          password
        } = req.body;

        if (
          !email ||
          !password
        ) {

          return res.json({
            error:
              "Email and password required"
          });

        }

        const {
          data,
          error
        } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) {

          return res.json({
            error:
              error.message
          });

        }

        res.json({
          success: true,
          token:
            data.session.access_token,
          user:
            data.user
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
