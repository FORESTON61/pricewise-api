const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const PORT = process.env.PORT || 3000;

// Scrape.do API key from Render
const SCRAPE_DO_KEY = process.env.SCRAPE_DO_KEY;

// Homepage
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Test route
app.get("/test", (req, res) => {
  res.json({
    status: "ok"
  });
});

// Price route
app.get("/price", async (req, res) => {

  const product = req.query.product;

  if (!product) {
    return res.json({
      error: "Product query missing"
    });
  }

  try {

    // Amazon search URL
    const amazonURL =
      `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // Scrape.do request
    const response = await axios.get(
      "http://api.scrape.do",
      {
        params: {
          token: SCRAPE_DO_KEY,
          url: amazonURL
        }
      }
    );

    const html = response.data;

    // Load HTML
    const $ = cheerio.load(html);

    // Amazon search result cards
    const results =
      $('[data-component-type="s-search-result"]');

    let productTitle = null;
    let currentPrice = null;
    let productImage = null;
    let productLink = null;

    // Loop products
    results.each((i, el) => {

      // Stop after finding first valid product
      if (currentPrice) return;

      // Full title
      const title = $(el)
        .find("h2")
        .text()
        .trim();

      // Price
      const whole = $(el)
        .find(".a-price-whole")
        .first()
        .text()
        .replace(/,/g, "")
        .trim();

      const fraction = $(el)
        .find(".a-price-fraction")
        .first()
        .text()
        .trim();

      const fullPrice =
        `${whole}${fraction}`;

      const price = parseInt(fullPrice);

      // Image
      const image = $(el)
        .find("img.s-image")
        .attr("src");

      // Link
      const href = $(el)
        .find("h2 a")
        .attr("href");

      const link = href
        ? `https://www.amazon.in${href}`
        : null;

      // Validate
      if (
        title &&
        !isNaN(price) &&
        price > 10000
      ) {

        productTitle = title;

        currentPrice = price;

        productImage = image;

        productLink = link;

      }

    });

    // If no product found
    if (!currentPrice) {

      return res.json({
        error: "No valid product found"
      });

    }

    // Temporary simulated history
    const history = [
      currentPrice + 8000,
      currentPrice + 5000,
      currentPrice + 2500,
      currentPrice + 1000,
      currentPrice
    ];

    // Lowest price
    const lowestPrice =
      Math.min(...history);

    // Difference %
    const differencePercent =
      (
        (
          (currentPrice - lowestPrice)
          / lowestPrice
        ) * 100
      ).toFixed(2);

    // Trend
    let trend = "stable";

    if (
      history[history.length - 1]
      >
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

    // Final JSON
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

      source: "Amazon India (scraped)"

    });

  } catch (error) {

    res.json({

      error: "Scraping failed",

      details: error.message

    });

  }

});

// Start server
app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
