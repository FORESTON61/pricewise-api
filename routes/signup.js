const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (supabase) => {

  const router = express.Router();

  const JWT_SECRET =
    process.env.JWT_SECRET ||
    "pricewise_secret_key";

  router.get("/signup", async (req, res) => {

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
      // CHECK EXISTING USER
      // =========================

      const {
        data: existingUser
      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser) {

        return res.json({
          error:
            "User already exists"
        });

      }

      // =========================
      // HASH PASSWORD
      // =========================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // =========================
      // INSERT USER
      // =========================

      const {
        data,
        error
      } = await supabase
        .from("users")
        .insert([
          {
            email,
            password:
              hashedPassword
          }
        ])
        .select()
        .single();

      if (error) {

        return res.json({
          error:
            error.message
        });

      }

      // =========================
      // GENERATE JWT TOKEN
      // =========================

      const token =
        jwt.sign(

          {
            id:
              data.id,

            email:
              data.email
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
          "Signup successful",

        token,

        user: {
          id:
            data.id,

          email:
            data.email
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
