const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const SCRAPE_DO_KEY = cc905285f3e942a09eb55538ab38f6909c3b1485772;

// ROOT ROUTE (so "/" doesn't show Not Found)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// TEST ROUTE (debug)
app.get("/test", (req, res) => {
  res.json({ status: "ok", message: "API working" });
});

// PRICE ROUTE
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

    const match = html.match(/₹[\d,]+/);

    if (!match) {
      return res.json({ error: "Price not found in page" });
    }

    const price = parseInt(match[0].replace(/[₹,]/g, ""));

    res.json({
      product,
      currentPrice: price,
      source: "Amazon scraped",
    });

  } catch (err) {
    res.json({
      error: "Scraping failed",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
