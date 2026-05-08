const express = require("express");
const rateLimit = require("express-rate-limit");

const { createClient } =
  require("@supabase/supabase-js");

// =========================
// ROUTES
// =========================

const authRoutes =
  require("./routes/auth");

const loginRoute =
  require("./routes/login");

const signupRoute =
  require("./routes/signup");

const alertsRoute =
  require("./routes/alerts");

const productsRoute =
  require("./routes/products");

const profileRoute =
  require("./routes/profile");

const wishlistRoute =
  require("./routes/wishlist");

// =========================
// SERVICES
// =========================

const scraperService =
  require("./services/scraper");

// =========================
// MIDDLEWARE
// =========================

const authMiddleware =
  require("./middleware/auth");

// =========================
// UTILS
// =========================

const cache =
  require("./utils/cache");

// =========================
// EXPRESS
// =========================

const app = express();

const PORT =
  process.env.PORT || 3000;

app.use(express.json());

// =========================
// RATE LIMITER
// =========================

const limiter =
  rateLimit({

    windowMs:
      60 * 1000,

    max:
      6,

    message: {
      error:
        "Too many requests. Please wait 1 minute."
    }

  });

app.use(limiter);

// =========================
// SUPABASE
// =========================

const supabase =
  createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_KEY

  );

// =========================
// ROUTES
// =========================

app.use(
  "/",
  authRoutes(
    supabase
  )
);

app.use(
  "/",
  loginRoute(
    supabase
  )
);

app.use(
  "/",
  signupRoute(
    supabase
  )
);

app.use(
  "/",
  alertsRoute(
    supabase,
    authMiddleware
  )
);

app.use(
  "/",
  productsRoute(
    async (
      product,
      cacheData
    ) => {

      return await scraperService(
        product,
        cacheData,
        supabase
      );

    },

    cache
  )
);

app.use(
  "/",
  profileRoute(
    authMiddleware
  )
);

app.use(
  "/",
  wishlistRoute(
    supabase,
    authMiddleware
  )
);

// =========================
// START SERVER
// =========================

app.listen(
  PORT,

  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);
