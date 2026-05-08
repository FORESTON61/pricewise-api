const express = require("express");
const bcrypt = require("bcryptjs");

module.exports = (supabase) => {

  const router = express.Router();

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

      const { error } =
        await supabase
          .from("users")
          .insert([
            {
              email,
              password:
                hashedPassword
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
          "Signup successful"

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
