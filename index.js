const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// ENV VARIABLES
// =========================

const SCRAPE_DO_KEY = process.env.SCRAPE_DO_KEY;

const SUPABASE_URL = process.env.SUPABASE_URL;

const SUPABASE_KEY = process.env.SUPABASE_KEY;

// =========================
// SUPABASE
// =========================

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// =========================
// HOMEPAGE
// =========================

app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// =========================
// TEST ROUTE
// =========================

app.get("/test", (req, res) => {
  res.json({
    status: "ok"
  });
});

// =========================
// PRICE ROUTE
// =========================

app.get("/price", async (req, res) => {

  const product = req.query.product;

  if (!product) {
    return res.json({
      error: "Product query missing"
    });
  }

  try {

    // =========================
    // AMAZON SEARCH URL
    // =========================

    const amazonURL =
      `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // =========================
    // SCRAPE AMAZON
    // =========================

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

    const $ = cheerio.load(html);

    const products =
      $('[data-component-type="s-search-result"]');

    let currentPrice = null;
    let productTitle = null;
    let productImage = null;
    let productLink = null;

    // =========================
    // FIND PRODUCT
    // =========================

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

      // ignore invalid prices

      if (
        title &&
        !isNaN(price) &&
        price > 1000
      ) {
        currentPrice = price;
        productTitle = title;
        productImage = image;
        productLink = link;
      }

    });

    // =========================
    // NO PRODUCT FOUND
    // =========================

    if (!currentPrice) {
      return res.json({
        error: "No valid product found"
      });
    }

    // =========================
    // SAVE PRICE TO SUPABASE
    // =========================

    await supabase
      .from("price_history")
      .insert([
        {
          product: product.toLowerCase(),
          price: currentPrice
        }
      ]);

    // =========================
    // GET HISTORY FROM DATABASE
    // =========================

    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product", product.toLowerCase())
      .order("created_at", {
        ascending: true
      });

    if (error) {
      return res.json({
        error: error.message
      });
    }

    // =========================
    // CREATE HISTORY ARRAY
    // =========================

    const history =
      data.map(item => item.price);

    // =========================
    // LOWEST PRICE
    // =========================

    const lowestPrice =
      Math.min(...history);

    // =========================
    // DIFFERENCE %
    // =========================

    const differencePercent =
      (
        (
          (currentPrice - lowestPrice)
          / lowestPrice
        ) * 100
      ).toFixed(2);

    // =========================
    // TREND
    // =========================

    let trend = "stable";

    if (
      history.length >= 2
    ) {

      const latest =
        history[history.length - 1];

      const previous =
        history[history.length - 2];

      if (latest > previous) {
        trend = "spike_up";
      }

      if (latest < previous) {
        trend = "drop";
      }

    }

    // =========================
    // DECISION SYSTEM
    // =========================

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

    // =========================
    // FINAL RESPONSE
    // =========================

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

      source: "Amazon India (real history)"

    });

  } catch (error) {

    res.json({
      error: "Scraping failed",
      details: error.message
    });

  }

});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
