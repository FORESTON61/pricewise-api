const express = require("express");
const data = require("./data");

const app = express();

const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Price Logic
app.get("/price", (req, res) => {
  const product = req.query.product;

  if (!product || !data[product]) {
    return res.status(404).json({
      error: "Product not found in dataset"
    });
  }

  const { currentPrice, lowestPrice } = data[product];

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

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
