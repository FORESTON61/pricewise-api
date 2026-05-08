const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (supabase) => {

  const router = express.Router();

  const JWT_SECRET =
    process.env.JWT_SECRET ||
    "pricewise_secret_key";

  router.get("/login", async (req, res) => {

    try {

      const email =
        req.query.email;

      const password =
        req.query.password;

      if (
        !email ||
        !password
      ) {

        return res.json({
          error:
            "Email and password required"
        });

      }

      // =========================
      // FIND USER
      // =========================

      const {
        data: user,
        error
      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (
        error ||
        !user
      ) {

        return res.json({
          error:
            "Invalid email or password"
        });

      }

      // =========================
      // CHECK PASSWORD
      // =========================

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {

        return res.json({
          error:
            "Invalid email or password"
        });

      }

      // =========================
      // GENERATE JWT TOKEN
      // =========================

      const token =
        jwt.sign(

          {
            id:
              user.id,

            email:
              user.email
          },

          JWT_SECRET,

          {
            expiresIn:
              "7d"
          }

        );

      // =========================
      // SUCCESS
      // =========================

      res.json({

        success: true,

        message:
          "Login successful",

        token,

        user: {
          id:
            user.id,

          email:
            user.email
        }

      });

    } catch (error) {

      res.json({
        error:
          error.message
      });

    }

  });

  return router;

};
