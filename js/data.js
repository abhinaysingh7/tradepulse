// Mock Indian stock market data for demo purposes

const INDICES = [
  { id: 'nifty50', name: 'Nifty 50', value: 24125.50, change: 142.30, changePct: 0.59 },
  { id: 'sensex', name: 'Sensex', value: 79462.15, change: 385.20, changePct: 0.49 },
  { id: 'banknifty', name: 'Bank Nifty', value: 51234.80, change: -98.45, changePct: -0.19 },
  { id: 'niftyit', name: 'Nifty IT', value: 38456.25, change: 256.10, changePct: 0.67 }
];

const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2845.50, change: 32.40, changePct: 1.15, volume: '2.4M', nifty50: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.75, change: -18.25, changePct: -0.44, volume: '1.1M', nifty50: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1689.30, change: 12.80, changePct: 0.76, volume: '3.2M', nifty50: true },
  { symbol: 'INFY', name: 'Infosys', price: 1892.60, change: 24.50, changePct: 1.31, volume: '1.8M', nifty50: true },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1245.80, change: -8.90, changePct: -0.71, volume: '2.9M', nifty50: true },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1567.25, change: 18.75, changePct: 1.21, volume: '1.5M', nifty50: true },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.40, change: 6.20, changePct: 0.77, volume: '4.1M', nifty50: true },
  { symbol: 'ITC', name: 'ITC Limited', price: 478.90, change: -2.35, changePct: -0.49, volume: '2.2M', nifty50: true },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2345.60, change: 15.40, changePct: 0.66, volume: '890K', nifty50: true },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3567.80, change: 28.90, changePct: 0.82, volume: '760K', nifty50: true },
  { symbol: 'WIPRO', name: 'Wipro', price: 542.30, change: -4.80, changePct: -0.88, volume: '1.3M', nifty50: false },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2890.45, change: 45.60, changePct: 1.60, volume: '980K', nifty50: false },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 978.25, change: -12.30, changePct: -1.24, volume: '3.5M', nifty50: false },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12456.00, change: 89.50, changePct: 0.72, volume: '420K', nifty50: true },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7234.50, change: -56.80, changePct: -0.78, volume: '650K', nifty50: true },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1678.90, change: 22.10, changePct: 1.33, volume: '1.1M', nifty50: true },
  { symbol: 'AXISBANK', name: 'Axis Bank', price: 1123.45, change: 9.75, changePct: 0.88, volume: '2.0M', nifty50: true },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1789.60, change: -14.20, changePct: -0.79, volume: '780K', nifty50: true },
  { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1567.30, change: 11.45, changePct: 0.74, volume: '920K', nifty50: true },
  { symbol: 'TITAN', name: 'Titan Company', price: 3456.80, change: 34.20, changePct: 1.00, volume: '540K', nifty50: true }
];

const DEFAULT_PORTFOLIO = [
  { symbol: 'RELIANCE', qty: 5, avgPrice: 2780.00 },
  { symbol: 'INFY', qty: 10, avgPrice: 1850.00 },
  { symbol: 'HDFCBANK', qty: 8, avgPrice: 1650.00 }
];

const DEFAULT_WATCHLIST = ['TCS', 'SBIN', 'MARUTI', 'ADANIENT'];

// Extra metadata for stock detail page (mock values)
const STOCK_META = {
  RELIANCE:   { marketCap: '19.2L Cr', pe: 28.4, high52: 3024, low52: 2220, sector: 'Oil & Gas' },
  TCS:        { marketCap: '14.8L Cr', pe: 32.1, high52: 4250, low52: 3311, sector: 'IT Services' },
  HDFCBANK:   { marketCap: '12.5L Cr', pe: 19.8, high52: 1794, low52: 1363, sector: 'Banking' },
  INFY:       { marketCap: '7.8L Cr',  pe: 26.5, high52: 1953, low52: 1350, sector: 'IT Services' },
  ICICIBANK:  { marketCap: '8.9L Cr',  pe: 18.2, high52: 1313, low52: 912,  sector: 'Banking' },
  BHARTIARTL: { marketCap: '9.1L Cr',  pe: 42.3, high52: 1595, low52: 1033, sector: 'Telecom' },
  SBIN:       { marketCap: '7.2L Cr',  pe: 10.5, high52: 912,  low52: 543,  sector: 'Banking' },
  ITC:        { marketCap: '5.9L Cr',  pe: 28.9, high52: 528,  low52: 392,  sector: 'FMCG' },
  HINDUNILVR: { marketCap: '5.5L Cr',  pe: 58.2, high52: 2450, low52: 2170, sector: 'FMCG' },
  LT:         { marketCap: '4.9L Cr',  pe: 35.6, high52: 3680, low52: 2965, sector: 'Infrastructure' },
  WIPRO:      { marketCap: '2.9L Cr',  pe: 24.1, high52: 575,  low52: 410,  sector: 'IT Services' },
  ADANIENT:   { marketCap: '3.3L Cr',  pe: 45.8, high52: 3743, low52: 2145, sector: 'Conglomerate' },
  TATAMOTORS: { marketCap: '3.6L Cr',  pe: 8.2,  high52: 1179, low52: 542,  sector: 'Automobile' },
  MARUTI:     { marketCap: '3.9L Cr',  pe: 27.4, high52: 13680, low52: 9737, sector: 'Automobile' },
  BAJFINANCE: { marketCap: '4.4L Cr',  pe: 31.2, high52: 8192, low52: 6187, sector: 'Finance' },
  SUNPHARMA:  { marketCap: '4.0L Cr',  pe: 36.8, high52: 1720, low52: 1205, sector: 'Pharma' },
  AXISBANK:   { marketCap: '3.5L Cr',  pe: 13.4, high52: 1339, low52: 933,  sector: 'Banking' },
  KOTAKBANK:  { marketCap: '3.6L Cr',  pe: 20.1, high52: 2301, low52: 1679, sector: 'Banking' },
  HCLTECH:    { marketCap: '4.2L Cr',  pe: 25.6, high52: 1699, low52: 1235, sector: 'IT Services' },
  TITAN:      { marketCap: '3.1L Cr',  pe: 88.4, high52: 3886, low52: 2965, sector: 'Consumer' }
};

function generateChartData(basePrice, points, volatility) {
  const data = [];
  let price = basePrice * (1 - volatility * 2);
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * basePrice * volatility;
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, price));
    data.push(parseFloat(price.toFixed(2)));
  }
  data[data.length - 1] = basePrice;
  return data;
}

const CHART_PERIODS = {
  '1D': { points: 24, volatility: 0.003, labels: () => Array.from({ length: 24 }, (_, i) => `${9 + Math.floor(i / 2)}:${i % 2 ? '30' : '00'}`) },
  '1W': { points: 7,  volatility: 0.008, labels: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { points: 30, volatility: 0.012, labels: () => Array.from({ length: 30 }, (_, i) => `${i + 1}`) },
  '1Y': { points: 12, volatility: 0.025, labels: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
};

function getChartData(symbol, period, currentPrice) {
  const config = CHART_PERIODS[period];
  return {
    prices: generateChartData(currentPrice, config.points, config.volatility),
    labels: config.labels()
  };
}