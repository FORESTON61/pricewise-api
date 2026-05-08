const axios = require("axios");
const cheerio = require("cheerio");

const aiDecision =
  require("./aiDecision");

const notifications =
  require("./notifications");

module.exports = async (
  product,
  cache,
  supabase
) => {

  try {

    const SCRAPE_DO_KEY =
      process.env.SCRAPE_DO_KEY;

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
    // CACHE CHECK
    // =========================

    const cachedData =
      cache[productSlug];

    if (cachedData) {

      const cacheAge =
        Date.now() -
        cachedData.timestamp;

      if (
        cacheAge <
        5 * 60 * 1000
      ) {

        return {
          ...cachedData.data,
          cached: true
        };

      }

    }

    // =========================
    // AMAZON URL
    // =========================

    const amazonURL =
      `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    // =========================
    // SCRAPE PAGE
    // =========================

    const response =
      await axios.get(
        "http://api.scrape.do",
        {
          params: {
            token:
              SCRAPE_DO_KEY,
            url:
              amazonURL
          }
        }
      );

    const html =
      response.data;

    const $ =
      cheerio.load(html);

    const products =
      $('[data-component-type="s-search-result"]');

    // =========================
    // SEARCH WORDS
    // =========================

    const searchWords =
      product
        .toLowerCase()
        .split(" ");

    let bestProduct =
      null;

    // =========================
    // LOOP PRODUCTS
    // =========================

    products.each((i, el) => {

      const title =
        $(el)
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
      // BLOCKED WORDS
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
      // SCORE
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
        titleLower.includes(
          product.toLowerCase()
        )
      ) {

        score += 25;

      }

      // =========================
      // PRICE
      // =========================

      const priceText =
        $(el)
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

      const image =
        $(el)
          .find("img")
          .attr("src");

      // =========================
      // LINK
      // =========================

      const href =
        $(el)
          .find("h2 a")
          .attr("href");

      const link =
        href
          ? `https://www.amazon.in${href}`
          : null;

      // =========================
      // SAVE BEST PRODUCT
      // =========================

      if (
        !bestProduct ||
        score >
          bestProduct.score
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

      return {
        error:
          "No valid product found"
      };

    }

    // =========================
    // GET HISTORY
    // =========================

    const {
      data: historyData
    } =
      await supabase
        .from("price_history")
        .select("*")
        .eq(
          "product_slug",
          productSlug
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );

    const history =
      historyData.map(
        item => item.price
      );

    // =========================
    // LOWEST PRICE
    // =========================

    const lowestPrice =
      Math.min(...history);

    // =========================
    // SAVE HISTORY
    // =========================

    const latestPrice =
      history[
        history.length - 1
      ];

    if (
      latestPrice !==
      bestProduct.price
    ) {

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

    }

    // =========================
    // AI DECISION
    // =========================

    const aiResult =
      aiDecision(
        bestProduct.price,
        lowestPrice,
        history
      );

    // =========================
    // ALERTS
    // =========================

    const triggeredAlerts =
      await notifications(
        supabase,
        productSlug,
        bestProduct.price
      );

    // =========================
    // FINAL DATA
    // =========================

    const finalData = {

      searchedProduct:
        product,

      productSlug,

      productTitle:
        bestProduct.title,

      currentPrice:
        bestProduct.price,

      lowestPrice,

      history,

      triggeredAlerts,

      productImage:
        bestProduct.image,

      productLink:
        bestProduct.link,

      source:
        "Amazon India",

      cached:
        false,

      ...aiResult

    };

    // =========================
    // SAVE CACHE
    // =========================

    cache[productSlug] = {

      timestamp:
        Date.now(),

      data:
        finalData

    };

    return finalData;

  } catch (error) {

    return {
      error:
        error.message
    };

  }

};
