const express = require("express");
const app = express();

const data = require("./data");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("PriceWise API is running 🚀");
});

app.get("/price", (req, res) => {
  try {
    const product = req.query.product?.toLowerCase();

    if (!product || !data[product]) {
      return res.json({ error: "Product not found in dataset" });
    }

    const history = data[product];
    const currentPrice = history[history.length - 1];
    const lowestPrice = Math.min(...history);

    const differencePercent = (
      ((currentPrice - lowestPrice) / lowestPrice) * 100
    );

    // 🔥 TREND LOGIC
    const recent = history.slice(-3);
    let trend = "stable";

    if (recent[2] > recent[1] && recent[1] > recent[0]) {
      trend = "rising";
    } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
      trend = "falling";
    } else if (recent[2] > recent[1] && recent[1] < recent[0]) {
      trend = "spike_up";
    } else if (recent[2] < recent[1] && recent[1] > recent[0]) {
      trend = "spike_down";
    }

    // 🔥 DECISION LOGIC
    let decision = "WAIT";
    let reason = "";

    if (differencePercent > 20 && trend === "rising") {
      decision = "AVOID";
      reason = "Price is high and still rising";
    } else if (trend === "spike_up") {
      decision = "AVOID";
      reason = "Recent sudden price spike";
    } else if (trend === "spike_down") {
      decision = "BUY";
      reason = "Recent drop, good opportunity";
    } else if (differencePercent > 20 && trend === "falling") {
      decision = "WAIT";
      reason = "Price is high but dropping";
    } else if (differencePercent < 10) {
      decision = "BUY";
      reason = "Price near lowest";
    } else {
      decision = "WAIT";
      reason = "No strong signal";
    }

    // 🔥 CONFIDENCE SCORE (0–100)
    let confidence = 50;

    // distance factor
    if (differencePercent > 30) confidence += 25;
    else if (differencePercent > 20) confidence += 15;
    else if (differencePercent < 10) confidence += 10;

    // trend strength
    if (trend === "spike_up" || trend === "spike_down") confidence += 20;
    else if (trend === "rising" || trend === "falling") confidence += 10;

    // cap
    if (confidence > 100) confidence = 100;

    res.json({
      product,
      currentPrice,
      lowestPrice,
      history,
      trend,
      differencePercent: differencePercent.toFixed(2),
      decision,
      confidence,
      reason
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
