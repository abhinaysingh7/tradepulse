// TradePulse — Curated Stock Catalog & Market Data

export const INDICES = [
  { id: 'sp500', name: 'S&P 500', symbol: '^GSPC', value: 5864.67, change: 24.15, changePct: 0.41, currency: '$' },
  { id: 'nasdaq', name: 'Nasdaq 100', symbol: '^NDX', value: 20439.20, change: 112.50, changePct: 0.55, currency: '$' },
  { id: 'dow', name: 'Dow Jones', symbol: '^DJI', value: 43239.05, change: -48.20, changePct: -0.11, currency: '$' },
  { id: 'nifty50', name: 'Nifty 50', symbol: '^NSEI', value: 24895.30, change: 135.80, changePct: 0.55, currency: '₹' }
];

export const INITIAL_STOCKS = [
  // ─── US Technology & Consumer (14) ───
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', category: 'Tech', price: 231.40, change: 2.85, changePct: 1.25, volume: '48.2M', high52: 237.23, low52: 164.08, pe: 34.2, marketCap: '$3.52T', currency: '$' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', category: 'Tech', price: 418.15, change: -1.75, changePct: -0.42, volume: '19.4M', high52: 468.35, low52: 326.93, pe: 35.8, marketCap: '$3.11T', currency: '$' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', category: 'Tech', price: 135.72, change: 4.12, changePct: 3.13, volume: '62.8M', high52: 140.76, low52: 39.23, pe: 64.5, marketCap: '$3.32T', currency: '$' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', category: 'Tech', price: 164.80, change: 1.65, changePct: 1.01, volume: '22.1M', high52: 191.75, low52: 120.21, pe: 24.1, marketCap: '$2.04T', currency: '$' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', category: 'Consumer', price: 187.90, change: 2.10, changePct: 1.13, volume: '31.5M', high52: 201.20, low52: 118.35, pe: 43.6, marketCap: '$1.97T', currency: '$' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', category: 'Automobile', price: 219.50, change: -5.40, changePct: -2.40, volume: '54.1M', high52: 271.00, low52: 138.80, pe: 61.2, marketCap: '$698B', currency: '$' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', category: 'Tech', price: 577.20, change: 8.90, changePct: 1.57, volume: '12.8M', high52: 602.95, low52: 279.40, pe: 28.7, marketCap: '$1.46T', currency: '$' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', category: 'Tech', price: 156.30, change: 3.45, changePct: 2.26, volume: '38.4M', high52: 227.30, low52: 94.04, pe: 115.2, marketCap: '$253B', currency: '$' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', category: 'Tech', price: 22.45, change: -0.65, changePct: -2.81, volume: '44.8M', high52: 51.28, low52: 18.51, pe: 32.4, marketCap: '$96B', currency: '$' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', category: 'Consumer', price: 704.20, change: 9.30, changePct: 1.34, volume: '4.2M', high52: 736.00, low52: 344.73, pe: 43.8, marketCap: '$302B', currency: '$' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', category: 'Tech', price: 505.80, change: -3.20, changePct: -0.63, volume: '2.9M', high52: 638.25, low52: 433.97, pe: 41.5, marketCap: '$225B', currency: '$' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', exchange: 'NASDAQ', category: 'Tech', price: 168.90, change: 1.80, changePct: 1.08, volume: '7.8M', high52: 230.63, low52: 104.33, pe: 22.1, marketCap: '$188B', currency: '$' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', category: 'Tech', price: 176.40, change: 2.15, changePct: 1.23, volume: '8.4M', high52: 179.34, low52: 99.26, pe: 42.8, marketCap: '$485B', currency: '$' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', category: 'Tech', price: 285.50, change: -1.40, changePct: -0.49, volume: '5.1M', high52: 318.72, low52: 193.68, pe: 50.3, marketCap: '$274B', currency: '$' },

  // ─── US Finance, Healthcare & Consumer (10) ───
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', category: 'Finance', price: 222.80, change: 1.45, changePct: 0.65, volume: '8.9M', high52: 225.48, low52: 140.40, pe: 12.4, marketCap: '$637B', currency: '$' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', category: 'Finance', price: 281.40, change: 1.90, changePct: 0.68, volume: '5.8M', high52: 293.07, low52: 227.78, pe: 30.6, marketCap: '$568B', currency: '$' },
  { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE', category: 'Finance', price: 492.10, change: 2.70, changePct: 0.55, volume: '2.4M', high52: 502.94, low52: 357.68, pe: 36.2, marketCap: '$455B', currency: '$' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', exchange: 'NYSE', category: 'Finance', price: 452.30, change: 1.10, changePct: 0.24, volume: '3.1M', high52: 484.00, low52: 337.00, pe: 21.4, marketCap: '$980B', currency: '$' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', category: 'Consumer', price: 80.50, change: 0.45, changePct: 0.56, volume: '14.2M', high52: 81.65, low52: 49.85, pe: 33.1, marketCap: '$646B', currency: '$' },
  { symbol: 'COST', name: 'Costco Wholesale', exchange: 'NASDAQ', category: 'Consumer', price: 902.80, change: 5.60, changePct: 0.62, volume: '1.9M', high52: 923.83, low52: 538.00, pe: 54.8, marketCap: '$400B', currency: '$' },
  { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE', category: 'Consumer', price: 68.20, change: -0.30, changePct: -0.44, volume: '11.5M', high52: 73.53, low52: 51.55, pe: 27.5, marketCap: '$294B', currency: '$' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', category: 'Healthcare', price: 161.40, change: 0.85, changePct: 0.53, volume: '6.4M', high52: 168.96, low52: 143.16, pe: 24.2, marketCap: '$388B', currency: '$' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE', category: 'Healthcare', price: 918.70, change: 12.40, changePct: 1.37, volume: '3.2M', high52: 972.53, low52: 516.57, pe: 118.0, marketCap: '$872B', currency: '$' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', category: 'Energy', price: 122.90, change: -1.15, changePct: -0.93, volume: '13.6M', high52: 126.34, low52: 95.77, pe: 14.8, marketCap: '$486B', currency: '$' },

  // ─── Indian Equities (12) ───
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', category: 'Energy', price: 2845.50, change: 32.40, changePct: 1.15, volume: '2.4M', high52: 3024.00, low52: 2220.00, pe: 28.4, marketCap: '₹19.2L Cr', currency: '₹' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', category: 'IT Services', price: 4120.75, change: -18.25, changePct: -0.44, volume: '1.1M', high52: 4250.00, low52: 3311.00, pe: 32.1, marketCap: '₹14.8L Cr', currency: '₹' },
  { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', category: 'IT Services', price: 1892.60, change: 24.50, changePct: 1.31, volume: '1.8M', high52: 1953.00, low52: 1350.00, pe: 26.5, marketCap: '₹7.8L Cr', currency: '₹' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', category: 'Finance', price: 1689.30, change: 12.80, changePct: 0.76, volume: '3.2M', high52: 1794.00, low52: 1363.00, pe: 19.8, marketCap: '₹12.5L Cr', currency: '₹' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', category: 'Finance', price: 1245.80, change: -8.90, changePct: -0.71, volume: '2.9M', high52: 1313.00, low52: 912.00, pe: 18.2, marketCap: '₹8.9L Cr', currency: '₹' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', category: 'Finance', price: 812.40, change: 6.20, changePct: 0.77, volume: '4.1M', high52: 912.00, low52: 543.00, pe: 10.5, marketCap: '₹7.2L Cr', currency: '₹' },
  { symbol: 'LT', name: 'Larsen & Toubro', exchange: 'NSE', category: 'Infrastructure', price: 3567.80, change: 28.90, changePct: 0.82, volume: '760K', high52: 3680.00, low52: 2965.00, pe: 35.6, marketCap: '₹4.9L Cr', currency: '₹' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', category: 'Telecom', price: 1567.25, change: 18.75, changePct: 1.21, volume: '1.5M', high52: 1595.00, low52: 1033.00, pe: 42.3, marketCap: '₹9.1L Cr', currency: '₹' },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', category: 'Consumer', price: 478.90, change: -2.35, changePct: -0.49, volume: '2.2M', high52: 528.00, low52: 392.00, pe: 28.9, marketCap: '₹5.9L Cr', currency: '₹' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', category: 'Automobile', price: 978.25, change: -12.30, changePct: -1.24, volume: '3.5M', high52: 1179.00, low52: 542.00, pe: 8.2, marketCap: '₹3.6L Cr', currency: '₹' },
  { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE', category: 'IT Services', price: 542.30, change: -4.80, changePct: -0.88, volume: '1.3M', high52: 575.00, low52: 410.00, pe: 24.1, marketCap: '₹2.9L Cr', currency: '₹' },
  { symbol: 'AXISBANK', name: 'Axis Bank', exchange: 'NSE', category: 'Finance', price: 1123.45, change: 9.75, changePct: 0.88, volume: '2.0M', high52: 1339.00, low52: 933.00, pe: 13.4, marketCap: '₹3.5L Cr', currency: '₹' }
];

export const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'RELIANCE', 'MSFT', 'HDFCBANK'];

export const DEFAULT_PORTFOLIO = [
  { symbol: 'AAPL', qty: 10, avgPrice: 220.00 },
  { symbol: 'NVDA', qty: 15, avgPrice: 122.50 },
  { symbol: 'MSFT', qty: 5, avgPrice: 410.00 },
  { symbol: 'RELIANCE', qty: 10, avgPrice: 2780.00 }
];

export const INITIAL_CASH_BALANCE = 50000.00;
