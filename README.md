# PriceWise API 🚀

Simple backend API that tells whether you should BUY, WAIT, or AVOID a product based on price comparison.

## Base URL
https://your-render-url.onrender.com

## Endpoints

### 1. Home
GET /
Returns API status

### 2. Health Check
GET /health

Response:
{
  "status": "ok"
}

### 3. Price Decision
GET /price?product=iphone

Response:
{
  "product": "iphone",
  "currentPrice": 23267,
  "lowestPrice": 18332,
  "differencePercent": "26.92",
  "decision": "AVOID",
  "reason": "Price significantly higher than usual"
}

## Logic
- <= lowest → BUY
- within +5% → BUY
- +5–15% → WAIT
- +15–25% → WAIT
- >25% → AVOID

## Note
Currently uses dummy data. Real price tracking coming next.
