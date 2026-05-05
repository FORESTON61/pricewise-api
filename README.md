# PriceWise API

Backend API for the PriceWise app — a smart system that helps users decide whether to Buy, Wait, or Avoid a product based on price trends.

---

## 🚀 What this does

- Provides price decision logic (Buy / Wait / Avoid)
- Serves API endpoints for mobile/web app
- Acts as the backend brain of PriceWise

---

## ⚙️ Tech Stack

- Node.js
- Express

---

## ▶️ Run locally

1. Install dependencies:
npm install

2. Start server:
node index.js

3. Open in browser:
http://localhost:3000

---

## 🌐 API Endpoints

### Root
GET /

Response:
PriceWise API running 🚀

---

### Health Check
GET /health

Response:
{
  "status": "ok"
}

---

### Price Check (Demo)
GET /price?product=iphone

Response:
{
  "product": "iphone",
  "decision": "WAIT",
  "reason": "Price tracking not implemented yet"
}

---

## ⚠️ Current Status

This is a basic backend setup.

- No real price tracking yet
- No database
- No external API integration

---

## 🧠 Future Plan

- Integrate price history (Amazon, Flipkart, etc.)
- Add real Buy/Wait decision engine
- Add user wishlist & alerts
- Optimize for scale

---

## 👤 Author

Built by FORESTON61
