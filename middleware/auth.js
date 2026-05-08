module.exports = async (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        error: "No token provided"
      });

    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    if (!token) {

      return res.status(401).json({
        error: "Invalid token"
      });

    }

    req.user = {
      token
    };

    next();

  } catch (error) {

    return res.status(500).json({
      error: "Authentication failed"
    });

  }

};
