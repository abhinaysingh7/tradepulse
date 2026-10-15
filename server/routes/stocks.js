// TradePulse — Express Stock Routes
import express from 'express';
import {
  getStockQuote,
  getStockCandles,
  searchStocks,
  getCompanyProfile
} from '../services/finnhub.js';

const router = express.Router();

/**
 * GET /api/stocks/quote?symbol=AAPL
 * Fetches real-time stock quote with server-side validation and caching
 */
router.get('/quote', async (req, res, next) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({
        error: 'Missing required query parameter "symbol"',
        status: 400
      });
    }

    const quote = await getStockQuote(symbol);
    return res.json(quote);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stocks/candles?symbol=AAPL&resolution=D&from=...&to=...
 * Fetches historical candle data with parameter validation
 */
router.get('/candles', async (req, res, next) => {
  try {
    const { symbol, resolution, from, to } = req.query;
    if (!symbol || !resolution || !from || !to) {
      return res.status(400).json({
        error: 'Missing required query parameters: symbol, resolution, from, to',
        status: 400
      });
    }

    const candles = await getStockCandles(symbol, resolution, from, to);
    return res.json(candles);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stocks/search?q=apple
 * Searches stock symbols via Finnhub
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        error: 'Missing query parameter "q"',
        status: 400
      });
    }

    const results = await searchStocks(q);
    return res.json(results);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stocks/profile?symbol=AAPL
 * Fetches company profile information
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({
        error: 'Missing required query parameter "symbol"',
        status: 400
      });
    }

    const profile = await getCompanyProfile(symbol);
    if (!profile) {
      return res.status(404).json({
        error: `Profile for symbol "${symbol}" not found`,
        status: 404
      });
    }
    return res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
