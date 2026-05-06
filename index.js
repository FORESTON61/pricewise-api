const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Scrape.do API Key from Render Environment Variables
const SCRAPE_DO_KEY = process.env.SCRAPE_DO_KEY;

// Homepage
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health check
app.get("/test", (req, res) => {
  res.json({
    status: "ok",
  });
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
    // Amazon India Search URL
    const amazonURL = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // Fetch HTML using Scrape.do
    const response = await axios.get("http://api.scrape.do", {
      params: {
        token: SCRAPE_DO_KEY,
        url: amazonURL,
      },
    });

    const html = response.data;

    // Load HTML
    const $ = cheerio.load(html);

    // Amazon search result cards
    const products = $('[data-component-type="s-search-result"]');

    let currentPrice = null;
    let productTitle = null;
    let productImage = null;
    let productLink = null;

    products.each((i, el) => {
      if (currentPrice) return;

      const title = $(el)
        .find("h2 span")
        .first()
        .text()
        .trim();

      const priceText = $(el)
        .find(".a-price-whole")
        .first()
        .text()
        .replace(/,/g, "")
        .trim();

      const image = $(el)
        .find("img")
        .attr("src");

      const href = $(el)
        .find("h2 a")
        .attr("href");

      const link = href
        ? `https://www.amazon.in${href}`
        : null;

      const price = parseInt(priceText);

      // Ignore invalid or tiny values
      if (
        title &&
        !isNaN(price) &&
        price > 10000
      ) {
        currentPrice = price;
        productTitle = title;
        productImage = image;
        productLink = link;
      }
    });

    // No valid product found
    if (!currentPrice) {
      return res.json({
        error: "No valid product found",
      });
    }

    // Simulated history for now
    const history = [
      currentPrice + 8000,
      currentPrice + 5000,
      currentPrice + 2000,
      currentPrice + 1000,
      currentPrice,
    ];

    // Lowest historical price
    const lowestPrice = Math.min(...history);

    // Difference %
    const differencePercent =
      (
        ((currentPrice - lowestPrice) / lowestPrice) *
        100
      ).toFixed(2);

    // Trend logic
    let trend = "stable";

    if (
      history[history.length - 1] >
      history[history.length - 2]
    ) {
      trend = "spike_up";
    }

    // Decision engine
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
      searchedProduct: product,
      productTitle,
      currentPrice,
      lowestPrice,
      history,
      trend,
      differencePercent,
      decision,
      confidence,
      reason,
      productImage,
      productLink,
      source: "Amazon India (scraped)",
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
