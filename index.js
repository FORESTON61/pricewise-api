const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Your Scrape.do API Key
const SCRAPE_DO_KEY = "cc905285f3e942a09eb55538ab38f6909c3b1485772";

// Homepage
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health check
app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

// Price Route
app.get("/price", async (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.json({
      error: "Product query missing",
    });
  }

  try {
    // Amazon India search URL
    const amazonURL = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // Scrape.do API Request
    const response = await axios.get("http://api.scrape.do", {
      params: {
        token: SCRAPE_DO_KEY,
        url: amazonURL,
      },
    });

    const html = response.data;

    // Extract ALL ₹ prices from page
    const matches = html.match(/₹[\d,]+/g);

    if (!matches || matches.length === 0) {
      return res.json({
        error: "No prices found",
      });
    }

    // Convert prices into numbers
    const prices = matches.map((p) =>
      parseInt(p.replace(/[₹,]/g, ""))
    );

    // Remove fake / tiny / unrealistic values
    const filteredPrices = prices.filter(
      (p) => p > 5000 && p < 200000
    );

    if (filteredPrices.length === 0) {
      return res.json({
        error: "No valid prices found",
      });
    }

    // Choose lowest realistic price
    const currentPrice = Math.min(...filteredPrices);

    // Fake history for MVP logic
    const history = [
      currentPrice + 8000,
      currentPrice + 5000,
      currentPrice + 3000,
      currentPrice + 1000,
      currentPrice,
    ];

    // Lowest historical price
    const lowestPrice = Math.min(...history);

    // Difference %
    const differencePercent = (
      ((currentPrice - lowestPrice) / lowestPrice) *
      100
    ).toFixed(2);

    // Trend detection
    let trend = "stable";

    if (
      history[history.length - 1] >
      history[history.length - 2]
    ) {
      trend = "spike_up";
    }

    // AI Decision Logic
    let decision = "WAIT";
    let confidence = 70;
    let reason = "No strong signal yet";

    if (trend === "spike_up") {
      decision = "AVOID";
      confidence = 85;
      reason = "Recent sudden price spike";
    }

    if (differencePercent < 5) {
      decision = "BUY";
      confidence = 90;
      reason = "Price near historical low";
    }

    // Final Response
    res.json({
      product,
      currentPrice,
      lowestPrice,
      history,
      trend,
      differencePercent,
      decision,
      confidence,
      reason,
      source: "Amazon (scraped)",
    });

  } catch (error) {
    res.json({
      error: "Scraping failed",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
