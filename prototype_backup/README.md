# TradePulse — Stock Market Dashboard

A mini project web application inspired by **Groww** and **Zerodha**, built with pure **HTML**, **CSS**, and **JavaScript**. TradePulse simulates a stock trading platform where users can explore NSE stocks, manage a portfolio, track a watchlist, and view detailed stock charts.

> **Note:** All market data is simulated for demonstration purposes. No real trading or live market API is connected.

---

## Features

| Feature | Description |
|---------|-------------|
| **Login / Sign Up** | User authentication with localStorage (includes demo account) |
| **Dashboard** | Market indices (Nifty 50, Sensex, Bank Nifty), portfolio summary, top gainers/losers |
| **Markets** | Browse 20 NSE stocks with search and filters (All, Gainers, Losers, Nifty 50) |
| **Stock Detail** | Click any stock to view price chart (1D/1W/1M/1Y), key stats, buy/sell actions |
| **Portfolio** | Track holdings with average price, current value, and P&L |
| **Watchlist** | Add/remove stocks to a personal watchlist |
| **Buy / Sell** | Simulated trading with quantity input and order confirmation |
| **Dark Mode** | Toggle between light and dark themes (saved in browser) |
| **Live Simulation** | Prices update every 3 seconds to mimic live market movement |
| **Responsive UI** | Works on desktop and mobile devices |

---

## Tech Stack

- **HTML5** — Semantic structure, forms, canvas for charts
- **CSS3** — Flexbox, Grid, CSS variables, dark mode, animations
- **JavaScript (ES6+)** — DOM manipulation, localStorage, Canvas API
- **No frameworks** — Zero dependencies, runs directly in the browser

---

## Project Structure

```
stock-market-mini/
├── login.html          # Login & sign up page (entry point)
├── index.html          # Main dashboard application
├── css/
│   └── style.css       # All styles including dark mode & auth
├── js/
│   ├── data.js         # Mock stock data, indices, chart helpers
│   ├── auth.js         # Authentication logic
│   └── app.js          # Main app logic, rendering, trading, charts
└── README.md           # This file
```

---

## How to Run

1. Clone or download this project folder
2. Open **`login.html`** in any modern browser (Chrome, Edge, Firefox)
3. Log in with the demo account or create a new account

### Demo Login Credentials

| Field | Value |
|-------|-------|
| Email | `demo@tradepulse.com` |
| Password | `demo123` |

### Alternative (Local Server)

```bash
# Using Python
cd stock-market-mini
python -m http.server 8080

# Then open http://localhost:8080/login.html
```

---

## Usage Guide

1. **Login** — Use demo credentials or sign up with any email/password
2. **Dashboard** — View market overview and your portfolio at a glance
3. **Markets** — Search stocks, filter by gainers/losers, click a stock name for details
4. **Stock Detail** — View price chart, switch time periods (1D/1W/1M/1Y), buy or sell
5. **Portfolio** — See all holdings with profit/loss calculations
6. **Watchlist** — Star stocks from Markets to track them
7. **Dark Mode** — Click the moon/sun icon in the top bar
8. **Reset Demo** — Restore default portfolio and stock data
9. **Logout** — Sign out from the sidebar

---

## Concepts Demonstrated

- Single Page Application (SPA) navigation without frameworks
- Client-side state management with JavaScript objects
- Persistent data using `localStorage`
- Canvas API for drawing interactive line charts
- CSS custom properties for theming (light/dark mode)
- Responsive design with media queries
- Form validation and user authentication flow
- Simulated real-time data updates with `setInterval`

---

## Future Enhancements

- Connect to a real stock market API (e.g., NSE/BSE data providers)
- Add mutual funds and IPO sections
- Implement price alerts and notifications
- Add technical indicators on charts (MA, RSI)
- Backend with Node.js/Python for secure authentication

---

## Author

Mini Project — TradePulse Stock Market Dashboard

## License

This project is created for educational purposes.