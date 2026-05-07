const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 3000;

// =========================
// ENV VARIABLES
// =========================

const SCRAPE_DO_KEY =
  process.env.SCRAPE_DO_KEY;

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_KEY;

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
// TEST
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

  const product =
    req.query.product;

  if (!product) {
    return res.json({
      error: "Product query missing"
    });
  }

  try {

    // =========================
    // SEARCH URL
    // =========================

    const amazonURL =
      `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // =========================
    // PRODUCT SLUG
    // =========================

    const productSlug =
      product
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // =========================
    // SCRAPE PAGE
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

    // =========================
    // SEARCH WORDS
    // =========================

    const searchWords =
      product
        .toLowerCase()
        .split(" ");

    let bestProduct = null;

    // =========================
    // LOOP PRODUCTS
    // =========================

    products.each((i, el) => {

      const title = $(el)
        .find("h2 span")
        .first()
        .text()
        .trim();

      if (!title) {
        return;
      }

      const titleLower =
        title.toLowerCase();

      // =========================
      // BRAND FILTERS
      // =========================

      if (
        product.toLowerCase().includes("iphone")
      ) {

        if (
          !titleLower.includes("iphone") &&
          !titleLower.includes("apple")
        ) {
          return;
        }

      }

      if (
        product.toLowerCase().includes("samsung")
      ) {

        if (
          !titleLower.includes("samsung")
        ) {
          return;
        }

      }

      if (
        product.toLowerCase().includes("airpods")
      ) {

        if (
          !titleLower.includes("airpods")
        ) {
          return;
        }

      }

      // =========================
      // SKIP BAD PRODUCTS
      // =========================

      const blockedWords = [
        "cover",
        "case",
        "charger",
        "cable",
        "protector",
        "tempered",
        "refurbished",
        "renewed",
        "adapter",
        "skin",
        "guard"
      ];

      const containsBlocked =
        blockedWords.some(word =>
          titleLower.includes(word)
        );

      if (containsBlocked) {
        return;
      }

      // =========================
      // MATCH SCORE
      // =========================

      let score = 0;

      searchWords.forEach(word => {

        if (
          titleLower.includes(word)
        ) {
          score += 2;
        }

      });

      if (
        titleLower.includes(product.toLowerCase())
      ) {
        score += 10;
      }

      // =========================
      // PRICE
      // =========================

      const priceText = $(el)
        .find(".a-price-whole")
        .first()
        .text()
        .replace(/,/g, "")
        .trim();

      const price =
        parseInt(priceText);

      if (
        isNaN(price) ||
        price < 1000
      ) {
        return;
      }

      // =========================
      // IMAGE
      // =========================

      const image = $(el)
        .find("img")
        .attr("src");

      // =========================
      // LINK
      // =========================

      const href = $(el)
        .find("h2 a")
        .attr("href");

      const link = href
        ? `https://www.amazon.in${href}`
        : null;

      // =========================
      // SAVE BEST MATCH
      // =========================

      if (
        !bestProduct ||
        score > bestProduct.score
      ) {

        bestProduct = {
          score,
          title,
          price,
          image,
          link
        };

      }

    });

    // =========================
    // NO PRODUCT
    // =========================

    if (!bestProduct) {

      return res.json({
        error: "No valid product found"
      });

    }

    // =========================
    // SAVE TO DATABASE
    // =========================

    await supabase
      .from("price_history")
      .insert([
        {
          product:
            productSlug,

          product_slug:
            productSlug,

          price:
            bestProduct.price
        }
      ]);

    // =========================
    // GET HISTORY
    // =========================

    const { data, error } =
      await supabase
        .from("price_history")
        .select("*")
        .eq(
          "product_slug",
          productSlug
        )
        .order("created_at", {
          ascending: true
        });

    if (error) {

      return res.json({
        error: error.message
      });

    }

    // =========================
    // HISTORY ARRAY
    // =========================

    const history =
      data.map(item =>
        item.price
      );

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
          (
            bestProduct.price -
            lowestPrice
          ) / lowestPrice
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
    // DECISION
    // =========================

    let decision = "WAIT";
    let confidence = 70;
    let reason =
      "No strong signal yet";

    if (trend === "spike_up") {

      decision = "AVOID";

      confidence = 85;

      reason =
        "Recent sudden price spike";

    }

    if (differencePercent < 5) {

      decision = "BUY";

      confidence = 90;

      reason =
        "Price near historical low";

    }

    // =========================
    // FINAL RESPONSE
    // =========================

    res.json({

      searchedProduct:
        product,

      productSlug,

      productTitle:
        bestProduct.title,

      currentPrice:
        bestProduct.price,

      lowestPrice,

      history,

      trend,

      differencePercent,

      decision,

      confidence,

      reason,

      productImage:
        bestProduct.image,

      productLink:
        bestProduct.link,

      source:
        "Amazon India (smart matching)"

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
