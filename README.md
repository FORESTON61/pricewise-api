# PriceWise API

Backend API for the PriceWise app — helps users decide whether to Buy, Wait, or Avoid products.

---

## 🚀 Features

- Basic API server
- Price decision endpoint (demo)
- Health check endpoint

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

3. Open:
http://localhost:3000

---

## 🌐 API

### GET /
Returns:
PriceWise API running 🚀

---

### GET /health
Returns:
{ "status": "ok" }

---

### GET /price?product=iphone
Returns:
{
  "product": "iphone",
  "decision": "WAIT",
  "reason": "Price tracking not implemented yet"
}

---

## ⚠️ Status

This is a starter backend.
No real price tracking yet.

---

## 👤 Author

FORESTON61
