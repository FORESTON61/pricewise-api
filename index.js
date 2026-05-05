const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Put your real key here
const SCRAPE_DO_KEY = "YOUR_REAL_KEY_HERE";

// Health route
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Price route
app.get("/price", async (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.json({ error: "Product is required" });
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

    // Extract first visible ₹ price
    const priceMatch = html.match(/₹[\d,]+/);

    if (!priceMatch) {
      return res.json({ error: "Price not found" });
    }

    const price = parseInt(priceMatch[0].replace(/[₹,]/g, ""));

    res.json({
      product,
      currentPrice: price,
      source: "Amazon (scraped)",
    });

  } catch (error) {
    res.json({
      error: "Scraping failed",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
