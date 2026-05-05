const express = require("express");

const app = express();

// IMPORTANT for Render
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("PriceWise API running 🚀");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Demo price endpoint
app.get("/price", (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({
      error: "Missing product parameter"
    });
  }

  res.json({
    product,
    decision: "WAIT",
    reason: "Price tracking not implemented yet"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
