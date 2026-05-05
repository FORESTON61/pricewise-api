const express = require("express");
const data = require("./data");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/price", (req, res) => {
  const product = req.query.product;

  if (!product || !data[product]) {
    return res.status(404).json({
      error: "Product not found in dataset"
    });
  }

  const history = data[product].history;

  const currentPrice = history[history.length - 1];
  const lowestPrice = Math.min(...history);

  const diffPercent = ((currentPrice - lowestPrice) / lowestPrice) * 100;

  let decision;
  let reason;

  if (currentPrice <= lowestPrice) {
    decision = "BUY";
    reason = "Lowest price in history";
  } else if (diffPercent <= 5) {
    decision = "BUY";
    reason = "Near lowest price";
  } else if (diffPercent <= 15) {
    decision = "WAIT";
    reason = "Slightly higher than usual";
  } else if (diffPercent <= 25) {
    decision = "WAIT";
    reason = "Moderately expensive";
  } else {
    decision = "AVOID";
    reason = "Too expensive compared to history";
  }

  res.json({
    product,
    currentPrice,
    lowestPrice,
    history,
    differencePercent: diffPercent.toFixed(2),
    decision,
    reason
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
