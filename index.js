const express = require("express");
const app = express();

const data = require("./data");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("PriceWise API is running 🚀");
});

app.get("/price", (req, res) => {
  const product = req.query.product?.toLowerCase();

  if (!product || !data[product]) {
    return res.json({ error: "Product not found in dataset" });
  }

  const history = data[product];
  const currentPrice = history[history.length - 1];
  const lowestPrice = Math.min(...history);

  const differencePercent = (
    ((currentPrice - lowestPrice) / lowestPrice) * 100
  ).toFixed(2);

  // 🔥 TREND LOGIC
  const recent = history.slice(-3); // last 3 prices
  let trend = "stable";

  if (recent[2] > recent[1] && recent[1] > recent[0]) {
    trend = "rising";
  } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
    trend = "falling";
  }

  // 🔥 DECISION LOGIC (UPGRADED)
  let decision = "BUY";
  let reason = "";

  if (differencePercent > 20 && trend === "rising") {
    decision = "AVOID";
    reason = "Price is high and still rising";
  } else if (differencePercent > 20 && trend === "falling") {
    decision = "WAIT";
    reason = "Price is high but dropping, wait more";
  } else if (differencePercent < 10 && trend === "falling") {
    decision = "BUY";
    reason = "Price is low and still dropping";
  } else {
    decision = "WAIT";
    reason = "No clear trend yet";
  }

  res.json({
    product,
    currentPrice,
    lowestPrice,
    history,
    trend,
    differencePercent,
    decision,
    reason
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
