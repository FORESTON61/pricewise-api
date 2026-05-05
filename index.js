const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// 🔐 Put your Scrape.do API key here
const SCRAPE_DO_KEY = "YOUR_SCRAPEDO_API_KEY";

const PORT = process.env.PORT || 3000;

// --- simple in-memory cache (reduce credits) ---
const cache = new Map(); // key -> { data, ts }
const TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// --- scrape amazon search page and extract first product price ---
async function fetchAmazonPrice(query) {
  // Amazon search URL (IN marketplace; change domain if needed)
  const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

  // Scrape.do endpoint
  const scrapeUrl = `https://api.scrape.do/?token=${SCRAPE_DO_KEY}&url=${encodeURIComponent(amazonUrl)}`;

  const res = await axios.get(scrapeUrl, {
    timeout: 20000,
    headers: {
      // basic UA helps sometimes
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile Safari/604.1",
    },
  });

  const html = res.data;
  const $ = cheerio.load(html);

  // Try common Amazon selectors for price in search results
  // (Amazon changes often; we try a few)
  let priceText =
    $(".s-result-item .a-price .a-offscreen").first().text() ||
    $(".s-result-item .a-price-whole").first().text();

  if (!priceText) {
    throw new Error("Price not found in page");
  }

  // Clean price (₹ 23,999 -> 23999)
  const numeric = priceText.replace(/[^0-9.]/g, "");
  const price = Number(numeric);

  if (!price || isNaN(price)) {
    throw new Error("Failed to parse price");
  }

  return price;
}

// --- routes ---
app.get("/", (req, res) => {
  res.send("PriceWise API is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/price", async (req, res) => {
  try {
    const product = req.query.product?.toLowerCase();

    if (!product) {
      return res.status(400).json({ error: "Missing product parameter" });
    }

    // cache first
    const cacheKey = `amazon:${product}`;
    let currentPrice = getCache(cacheKey);

    let source = "cache";

    if (!currentPrice) {
      // fetch live
      currentPrice = await fetchAmazonPrice(product);
      setCache(cacheKey, currentPrice);
      source = "scrape.do";
    }

    // --- simple history (mock for now; later store DB) ---
    // Keep your previous idea alive
    const history = [
      Math.round(currentPrice * 1.1),
      Math.round(currentPrice * 1.05),
      Math.round(currentPrice * 0.95),
      currentPrice,
    ];

    const lowestPrice = Math.min(...history);
    const differencePercent =
      ((currentPrice - lowestPrice) / lowestPrice) * 100;

    // --- trend ---
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

    // --- decision ---
    let decision = "WAIT";
    let reason = "";

    if (differencePercent > 20 && trend === "rising") {
      decision = "AVOID";
      reason = "Price is high and rising";
    } else if (trend === "spike_up") {
      decision = "AVOID";
      reason = "Recent price spike";
    } else if (trend === "spike_down") {
      decision = "BUY";
      reason = "Recent drop";
    } else if (differencePercent < 10) {
      decision = "BUY";
      reason = "Near lowest price";
    } else {
      decision = "WAIT";
      reason = "No strong signal";
    }

    // --- confidence ---
    let confidence = 50;
    if (differencePercent > 30) confidence += 25;
    else if (differencePercent > 20) confidence += 15;
    else if (differencePercent < 10) confidence += 10;

    if (trend === "spike_up" || trend === "spike_down") confidence += 20;
    else if (trend === "rising" || trend === "falling") confidence += 10;

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
      reason,
      source,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
