const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        error:
          "No token provided"
      });

    }

    // =========================
    // GET TOKEN
    // =========================

    const token =
      authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        error:
          "Invalid token format"
      });

    }

    // =========================
    // VERIFY TOKEN
    // =========================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // =========================
    // SAVE USER
    // =========================

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      error:
        "Unauthorized"
    });

  }

};
