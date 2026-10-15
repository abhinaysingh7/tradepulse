# TradePulse — Real-Time Stock Price Dashboard & Backend

**TradePulse** is a full-stack financial dashboard designed for a **BTech Mini Project**. It connects a modern **React + Vite** frontend to a secure **Node.js + Express** API gateway that interfaces with the **Finnhub Stock API**, featuring interactive **Chart.js** financial visualizations, live alerts, paper-trading portfolio management, and automated P&L tracking.

---

## 🌟 Architecture & Key Features

```
┌─────────────────────────────────┐
│ React 19 Frontend (Vite)        │  <-- Running on http://localhost:5173
│ - Clean Fintech Navy UI         │
│ - Chart.js + Stochastic Models  │
│ - Paper Trading & P&L Storage   │
└────────────────┬────────────────┘
                 │ /api requests (Vite Proxy or CORS)
                 ▼
┌─────────────────────────────────┐
│ Node.js + Express Backend       │  <-- Running on http://localhost:5001
│ - Zero Client Key Exposure      │
│ - In-Memory 30s Caching (60/min)│
│ - Parameter & Symbol Validation │
│ - Graceful Fallback Engine      │
└────────────────┬────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────┐
│ Upstream Finnhub Stock API      │  <-- https://finnhub.io/api/v1
└─────────────────────────────────┘
```

| Feature | Description |
|---|---|
| **Secure Node.js Backend** | Express API gateway keeping `FINNHUB_API_KEY` hidden server-side; zero secrets leaked in client code, bundles, or responses. |
| **In-Memory Caching** | 30s quote cache, 60s candle cache, and 5-min search cache protecting against Finnhub's 60 req/min free rate limit. |
| **Interactive Chart.js** | Multi-timeframe line charts (**1D**, **1W**, **1M**, **1Y**) with realistic stochastic Brownian motion matching live LTP. |
| **Dual Currency Support** | Native Indian Rupee (`₹`) for NSE equities and US Dollar (`$`) for NASDAQ/NYSE listings. |
| **In-App Price Alerts** | Above/below threshold triggers with duplicate notification suppression. |
| **Paper Trading Portfolio** | Virtual $50,000 cash balance, buy/sell validations, real-time market valuation, and weighted average price. |
| **Watchlist & Search** | Instant ticker/company search and local-storage persisted watchlist. |

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 6+, Chart.js 4, react-chartjs-2, Lucide React
- **Backend:** Node.js, Express 5, CORS, Dotenv
- **External API:** Finnhub Stock API (US & Global equities)
- **Styling:** Modular Dark Navy/Charcoal Fintech Theme (`#0b0f19`/`#10b981`), Tabular Numerals
- **Testing:** Node.js native assert test runner (`npm test`)

---

## 📂 Project Structure

```
STOCK MP/
├── server/
│   ├── index.js            # Express server entry point, CORS, and health check
│   ├── routes/
│   │   └── stocks.js       # /api/stocks quote, candles, search, and profile routes
│   └── services/
│       └── finnhub.js      # Server-side Finnhub fetching, in-memory caching, validation
├── src/
│   ├── main.jsx            # React root bootstrap
│   ├── App.jsx             # State management, navigation & trading logic
│   ├── components/         # Modular React UI components
│   │   ├── TradePulseLogo.jsx # Geometric SVG brand mark
│   │   ├── Sidebar.jsx     # Navigation drawer
│   │   ├── Topbar.jsx      # Search, cash pill, theme toggle
│   │   ├── Markets.jsx     # 36 Equities table with mover filters
│   │   ├── StockChart.jsx  # Chart.js visualization
│   │   ├── Portfolio.jsx   # Virtual holdings & P&L breakdown
│   │   ├── Watchlist.jsx   # Tracked tickers
│   │   ├── PriceAlerts.jsx # Threshold trigger engine
│   │   ├── TradeModal.jsx  # Buy/sell order dialog
│   │   ├── ApiSettingsModal.jsx # Backend gateway health status & demo reset
│   │   └── Login.jsx       # Student demo authentication
│   ├── data/
│   │   └── stocksData.js   # 36 curated equities, indices, and defaults
│   └── services/
│       └── stockApi.js     # Frontend service communicating with /api/stocks
├── test/
│   ├── verify_tradepulse.js# Core calculations, portfolio & alert tests
│   └── verify_backend.js   # Backend API health, validation & security tests
├── render.yaml             # Render Blueprint specification for free deployment
├── vite.config.js          # Vite config with /api proxy to Express backend
├── package.json            # Scripts and dependencies
└── .env.example            # Environment configuration template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher; tested on v24)
- **npm** (v9.0.0 or higher)

### Installation

1. Navigate to the project directory:
   ```bash
   cd "STOCK MP"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure Finnhub API Key on the Backend:
   - Copy the environment template:
     ```bash
     cp .env.example .env
     ```
   - Obtain a free API key at [finnhub.io](https://finnhub.io) and set it in `.env`:
     ```env
     PORT=5001
     FINNHUB_API_KEY=your_actual_finnhub_key_here
     ```
   - *Note: If no key is set, the server responds with HTTP 503 and the application seamlessly falls back to the built-in TradePulse Market Engine so the dashboard always works for demonstrations.*

### Running Locally

You can run both frontend and backend concurrently in separate terminals:

**Terminal 1 — Backend API Server:**
```bash
npm run server
```
*Server starts on `http://localhost:5001` (Health check: `http://localhost:5001/api/health`)*

**Terminal 2 — Frontend Dev Server:**
```bash
npm run dev
```
*Vite starts on `http://localhost:5173/` and proxies `/api` to port 5001 automatically.*

---

## 📡 Backend API Reference

All endpoints return standard JSON and validate parameters strictly.

### 1. Health Check
- **`GET /api/health`**
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "TradePulse API",
    "uptime": 124,
    "timestamp": "2026-10-15T17:35:10.121Z",
    "hasFinnhubKey": true
  }
  ```

### 2. Stock Quote
- **`GET /api/stocks/quote?symbol=AAPL`**
- **Response:**
  ```json
  {
    "symbol": "AAPL",
    "price": 231.50,
    "change": 2.15,
    "changePct": 0.94,
    "high": 233.00,
    "low": 229.10,
    "open": 230.00,
    "prevClose": 229.35,
    "timestamp": 1729000000,
    "source": "Finnhub Real-Time API",
    "isRealData": true
  }
  ```

### 3. Historical Candles
- **`GET /api/stocks/candles?symbol=AAPL&resolution=D&from=1726000000&to=1729000000`**
- **Response:**
  ```json
  {
    "s": "ok",
    "symbol": "AAPL",
    "prices": [228.1, 229.4, 231.5],
    "volumes": [45000000, 52000000, 48000000],
    "timestamps": [1726000000, 1726086400, 1726172800],
    "source": "Finnhub Live Market History"
  }
  ```

### 4. Stock Search
- **`GET /api/stocks/search?q=apple`**
- **Response:** Array of matched equity symbols and descriptions.

---

## 🧪 Automated Testing & Production Build

Run the end-to-end automated test suite:
```bash
npm test
```
*Executes both `test/verify_tradepulse.js` (6 unit tests) and `test/verify_backend.js` (7 backend API & security tests).*

Compile the production bundle:
```bash
npm run build
```

---

## ☁️ Free Deployment on Render

TradePulse is configured for 100% free hosting using **Render** ([render.com](https://render.com)).

### Option A: Render Blueprint (Recommended)
The repository includes a ready-to-use [`render.yaml`](file:///Users/abhinaysingh/Desktop/STOCK%20MP/render.yaml) specification:

1. Push your repository to **GitHub**.
2. Log into [Render](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository. Render reads `render.yaml` and sets up:
   - **`tradepulse-backend`**: Free Web Service running Node/Express (`npm run server`).
   - **`tradepulse-frontend`**: Free Static Site building Vite (`npm run build`, publish dir: `dist`).
5. In the Render Dashboard:
   - In `tradepulse-backend` -> **Environment**: Add `FINNHUB_API_KEY` with your secret key.
   - In `tradepulse-backend` -> **Environment**: Add `CORS_ORIGIN` set to your frontend URL.
   - In `tradepulse-frontend` -> **Environment**: Add `VITE_API_BASE_URL` pointing to your backend URL (`https://tradepulse-backend.onrender.com`).

### Option B: Single Free Web Service
Because `server/index.js` automatically serves `dist/index.html` as static files in production, you can also deploy as a single free Web Service:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run server`
- **Environment Variables:** `FINNHUB_API_KEY=your_key`, `NODE_ENV=production`
- Single URL hosts both frontend and `/api` on the same origin without needing CORS!

---

## ⚠️ Free-Tier Limitations & Behavior

1. **Render Free Web Service Sleep**:
   - Free instances on Render spin down automatically after 15 minutes of inactivity.
   - The first request after a sleep period may take 30–50 seconds to wake up (cold start).
2. **Finnhub Rate Limits**:
   - Finnhub's free tier provides 60 requests/minute.
   - TradePulse uses server-side in-memory caching (30s) and batching to stay well within limits.
3. **Data Coverage**:
   - Finnhub's free tier specializes in US Equities (NYSE, NASDAQ).
   - Indian NSE symbols utilize the built-in TradePulse realistic stochastic market engine.

---

## 🛠️ Troubleshooting

- **Port 5000 in use on macOS:** macOS AirPlay Receiver occupies port 5000. TradePulse defaults to port `5001` locally to prevent conflicts.
- **CORS Error in Production:** Ensure `CORS_ORIGIN` in backend environment variables matches your frontend URL without trailing slashes.
- **Finnhub Key Rotation:** If your API key is ever compromised or revoked, update `FINNHUB_API_KEY` in your `.env` or Render environment settings; you never need to rebuild or re-bundle the frontend.