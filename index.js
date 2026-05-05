const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 IMPORTANT: Paste your REAL Scrape.do key below
const SCRAPE_DO_KEY = "PASTE_YOUR_REAL_KEY_HERE";

// Root route (so "/" never shows Not Found)
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Debug route
app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

// Price route
app.get("/price", async (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.json({ error: "Product query missing" });
  }

  try {
    const amazonURL = `https://www.amazon.in/s?k=${product}`;

    const response = await axios.get("http://api.scrape.do", {
      params: {
        token: SCRAPE_DO_KEY,
        url: amazonURL,
      },
    });

    const html = response.data;

    // Extract ₹ price
    const match = html.match(/₹[\d,]+/);

    if (!match) {
      return res.json({ error: "Price not found" });
    }

    const price = parseInt(match[0].replace(/[₹,]/g, ""));

    res.json({
      product,
      currentPrice: price,
      source: "Amazon (scraped)"
    });

  } catch (error) {
    res.json({
      error: "Scraping failed",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
