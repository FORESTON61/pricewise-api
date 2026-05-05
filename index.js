const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 PRICE ENGINE
app.get("/price", (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({
      error: "Missing product parameter"
    });
  }

  // 🔹 Simulated price data (later replace with real APIs)
  const currentPrice = Math.floor(Math.random() * 20000) + 5000;
  const lowestPrice = Math.floor(Math.random() * 20000) + 3000;

  // Ensure lowest <= current (realistic)
  const realLowest = Math.min(currentPrice, lowestPrice);

  // % difference
  const diffPercent = ((currentPrice - realLowest) / realLowest) * 100;

  let decision;
  let reason;

  if (diffPercent <= 5) {
    decision = "BUY";
    reason = "Price is near historical low";
  } else if (diffPercent <= 20) {
    decision = "WAIT";
    reason = "Price is moderate, may drop";
  } else {
    decision = "AVOID";
    reason = "Price is significantly higher than usual";
  }

  res.json({
    product,
    currentPrice,
    lowestPrice: realLowest,
    differencePercent: diffPercent.toFixed(2) + "%",
    decision,
    reason
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
