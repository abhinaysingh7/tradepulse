// TradePulse — Server-Side Finnhub API Service
// Manages external API calls, in-memory caching, timeouts, and sanitization

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const REQUEST_TIMEOUT_MS = 8000;

// In-memory caches to respect Finnhub free tier limits (60 req/min)
const quoteCache = new Map();
const candleCache = new Map();
const searchCache = new Map();
const profileCache = new Map();

const QUOTE_CACHE_TTL_MS = 30 * 1000;      // 30 seconds
const CANDLE_CACHE_TTL_MS = 60 * 1000;     // 60 seconds
const SEARCH_CACHE_TTL_MS = 300 * 1000;    // 5 minutes
const PROFILE_CACHE_TTL_MS = 3600 * 1000;  // 1 hour

function getApiKey() {
  return (process.env.FINNHUB_API_KEY || '').trim();
}

/**
 * Perform fetch with a strict timeout using AbortSignal
 */
async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const signal = AbortSignal.timeout(timeoutMs);
  return fetch(url, { signal });
}

/**
 * Validate stock symbol format (1-10 uppercase alphanumeric chars with optional dot)
 */
export function isValidSymbol(symbol) {
  if (typeof symbol !== 'string') return false;
  const clean = symbol.trim().toUpperCase();
  return /^[A-Z0-9.]{1,10}$/.test(clean);
}

/**
 * Fetch real-time stock quote from Finnhub with caching
 */
export async function getStockQuote(symbol) {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!isValidSymbol(cleanSymbol)) {
    const err = new Error('Invalid stock symbol parameter');
    err.status = 400;
    throw err;
  }

  // Check cache
  const cached = quoteCache.get(cleanSymbol);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, cached: true };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('FINNHUB_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }

  const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(cleanSymbol)}&token=${apiKey}`;

  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (netErr) {
    const isTimeout = netErr.name === 'TimeoutError';
    const err = new Error(isTimeout ? 'Upstream Finnhub API request timed out' : 'Failed to connect to Finnhub API');
    err.status = 504;
    throw err;
  }

  if (res.status === 429) {
    const err = new Error('Finnhub API rate limit reached (60 req/min)');
    err.status = 429;
    throw err;
  }

  if (res.status === 401) {
    const err = new Error('Invalid Finnhub API key configured on server');
    err.status = 502;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Finnhub API error (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    throw err;
  }

  const data = await res.json();
  if (!data || (data.c === 0 && data.pc === 0 && data.h === 0)) {
    const err = new Error(`Stock symbol "${cleanSymbol}" not actively traded or found on Finnhub`);
    err.status = 404;
    throw err;
  }

  const price = data.c;
  const prevClose = data.pc || price;
  const change = data.d !== null && data.d !== undefined ? data.d : (price - prevClose);
  const changePct = data.dp !== null && data.dp !== undefined ? data.dp : (prevClose ? ((change / prevClose) * 100) : 0);

  const formatted = {
    symbol: cleanSymbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
    high: data.h ? parseFloat(data.h.toFixed(2)) : price,
    low: data.l ? parseFloat(data.l.toFixed(2)) : price,
    open: data.o ? parseFloat(data.o.toFixed(2)) : price,
    prevClose: parseFloat(prevClose.toFixed(2)),
    timestamp: data.t || Math.floor(Date.now() / 1000),
    source: 'Finnhub Real-Time API',
    isRealData: true
  };

  // Cache response
  quoteCache.set(cleanSymbol, {
    data: formatted,
    expiresAt: Date.now() + QUOTE_CACHE_TTL_MS
  });

  return formatted;
}

/**
 * Fetch historical candles from Finnhub
 */
export async function getStockCandles(symbol, resolution, from, to) {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!isValidSymbol(cleanSymbol)) {
    const err = new Error('Invalid stock symbol parameter');
    err.status = 400;
    throw err;
  }

  const allowedResolutions = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];
  if (!allowedResolutions.includes(resolution)) {
    const err = new Error(`Invalid resolution "${resolution}". Allowed: ${allowedResolutions.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const fromNum = parseInt(from, 10);
  const toNum = parseInt(to, 10);
  if (isNaN(fromNum) || isNaN(toNum) || fromNum >= toNum || fromNum < 0) {
    const err = new Error('Invalid from/to timestamp range');
    err.status = 400;
    throw err;
  }

  const cacheKey = `${cleanSymbol}_${resolution}_${fromNum}_${toNum}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, cached: true };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('FINNHUB_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }

  const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${encodeURIComponent(cleanSymbol)}&resolution=${encodeURIComponent(resolution)}&from=${fromNum}&to=${toNum}&token=${apiKey}`;

  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (netErr) {
    const err = new Error('Failed to connect to Finnhub candle endpoint');
    err.status = 504;
    throw err;
  }

  if (res.status === 429) {
    const err = new Error('Finnhub API rate limit reached (60 req/min)');
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Finnhub candle API error (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    throw err;
  }

  const data = await res.json();
  if (!data || data.s === 'no_data' || !Array.isArray(data.c) || data.c.length === 0) {
    return {
      s: 'no_data',
      symbol: cleanSymbol,
      prices: [],
      timestamps: [],
      volumes: [],
      isRealData: false,
      source: 'Finnhub (No Historical Data)'
    };
  }

  const formatted = {
    s: 'ok',
    symbol: cleanSymbol,
    prices: data.c.map(v => parseFloat(v.toFixed(2))),
    volumes: data.v || [],
    timestamps: data.t || [],
    highs: data.h || [],
    lows: data.l || [],
    opens: data.o || [],
    isRealData: true,
    source: 'Finnhub Live Market History'
  };

  candleCache.set(cacheKey, {
    data: formatted,
    expiresAt: Date.now() + CANDLE_CACHE_TTL_MS
  });

  return formatted;
}

/**
 * Search stocks via Finnhub
 */
export async function searchStocks(query) {
  if (typeof query !== 'string' || !query.trim()) {
    const err = new Error('Query parameter "q" is required');
    err.status = 400;
    throw err;
  }

  const cleanQuery = query.trim().slice(0, 50);
  const cacheKey = cleanQuery.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('FINNHUB_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }

  const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}&token=${apiKey}`;

  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (netErr) {
    const err = new Error('Failed to connect to Finnhub search endpoint');
    err.status = 504;
    throw err;
  }

  if (res.status === 429) {
    const err = new Error('Finnhub API rate limit reached (60 req/min)');
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Finnhub search API error (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    throw err;
  }

  const data = await res.json();
  const results = (data?.result || [])
    .filter(item => item && item.symbol && !item.symbol.includes('.'))
    .slice(0, 10)
    .map(item => ({
      symbol: item.symbol,
      name: item.description || item.symbol,
      type: item.type || 'Common Stock',
      displaySymbol: item.displaySymbol || item.symbol
    }));

  searchCache.set(cacheKey, {
    data: results,
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS
  });

  return results;
}

/**
 * Fetch company profile
 */
export async function getCompanyProfile(symbol) {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!isValidSymbol(cleanSymbol)) {
    const err = new Error('Invalid stock symbol parameter');
    err.status = 400;
    throw err;
  }

  const cached = profileCache.get(cleanSymbol);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(cleanSymbol)}&token=${apiKey}`;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.name) {
      const profile = {
        name: data.name,
        ticker: data.ticker,
        industry: data.finnhubIndustry || 'General',
        marketCap: data.marketCapitalization ? `$${(data.marketCapitalization / 1000).toFixed(2)}B` : '—',
        exchange: data.exchange || 'US',
        weburl: data.weburl || '',
        currency: data.currency || 'USD'
      };
      profileCache.set(cleanSymbol, {
        data: profile,
        expiresAt: Date.now() + PROFILE_CACHE_TTL_MS
      });
      return profile;
    }
  } catch (e) {
    // Ignore profile errors gracefully
  }
  return null;
}
