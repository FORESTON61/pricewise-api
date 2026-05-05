const express = require("express");

const app = express();

// IMPORTANT for Render
const PORT = process.env.PORT || 3000;

// Home route
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Price decision engine
app.get("/price", (req, res) => {
  const product = req.query.product || "unknown";

  // TEMP DATA (will replace later with real data)
  const currentPrice = 23267;
  const lowestPrice = 18332;

  const diffPercent = ((currentPrice - lowestPrice) / lowestPrice) * 100;

  let decision;
  let reason;

  if (currentPrice <= lowestPrice) {
    decision = "BUY";
    reason = "Lowest price reached";
  } else if (diffPercent <= 5) {
    decision = "BUY";
    reason = "Close to lowest price";
  } else if (diffPercent <= 15) {
    decision = "WAIT";
    reason = "Price slightly higher than usual";
  } else if (diffPercent <= 25) {
    decision = "WAIT";
    reason = "Price moderately high";
  } else {
    decision = "AVOID";
    reason = "Price significantly higher than usual";
  }

  res.json({
    product,
    currentPrice,
    lowestPrice,
    differencePercent: diffPercent.toFixed(2),
    decision,
    reason
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
