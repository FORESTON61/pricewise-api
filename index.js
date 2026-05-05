const express = require("express");
const app = express();

// IMPORTANT for Render (dynamic port)
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("PriceWise API is running 🚀");
});

// Example endpoint (future use)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
