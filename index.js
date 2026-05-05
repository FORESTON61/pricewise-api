const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("PriceWise API is running 🚀");
});

// Health check (important for hosting + monitoring)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example placeholder route (future logic)
app.get("/price", (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({ error: "Product is required" });
  }

  res.json({
    product,
    decision: "WAIT", // placeholder
    message: "Price analysis coming soon"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
