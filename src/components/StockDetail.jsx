import React, { useState, useEffect } from 'react';
import StockChart from './StockChart';
import {
  fetchStockQuote,
  formatTimestamp,
  formatStockPrice,
  getStockCurrency,
  hasCustomApiKey
} from '../services/stockApi';
import { ArrowLeft, Star, Bell } from 'lucide-react';

export default function StockDetail({
  symbol,
  stocks = [],
  watchlist = [],
  portfolio = [],
  onBack,
  onOpenTradeModal,
  onToggleWatchlist,
  onOpenAlertModal,
  isDark,
  onUpdateQuote
}) {
  const [stockData, setStockData] = useState(() => {
    return stocks.find(s => s.symbol === symbol) || {
      symbol,
      name: symbol,
      price: 150.00,
      change: 0.00,
      changePct: 0.00,
      volume: '—'
    };
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Recently');
  const [apiError, setApiError] = useState(null);

  const currency = getStockCurrency(symbol);

  // Sync with prop stock changes
  useEffect(() => {
    const found = stocks.find(s => s.symbol === symbol);
    if (found) {
      setStockData(found);
    }
  }, [symbol, stocks]);

  // Fetch fresh real quote on mount or symbol change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setApiError(null);

    fetchStockQuote(symbol).then(res => {
      if (!isMounted) return;
      setLoading(false);
      if (res && !res.error && res.price) {
        setStockData(prev => ({
          ...prev,
          price: res.price,
          change: res.change,
          changePct: res.changePct,
          high: res.high,
          low: res.low,
          open: res.open,
          prevClose: res.prevClose,
          timestamp: res.timestamp,
          source: res.source
        }));
        setLastUpdated(formatTimestamp(res.timestamp));
        if (onUpdateQuote) {
          onUpdateQuote(res);
        }
      } else if (res && res.error && hasCustomApiKey()) {
        setApiError(res.error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const isWatched = watchlist.includes(symbol);
  const hasHolding = portfolio.some(h => h.symbol === symbol);
  const isPos = stockData.changePct >= 0;

  return (
    <section className="section active" id="stock-detail">
      <button
        className="back-btn"
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={15} /> Back to Markets
      </button>

      {apiError && (
        <div className="alert-banner" style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.12)', borderLeftColor: '#ef4444', color: 'var(--danger)' }}>
          <div>
            <strong>Notice:</strong> {apiError}
          </div>
        </div>
      )}

      <div className="stock-detail-header" style={{ marginTop: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">{stockData.name}</h1>
            <span className={`api-badge ${stockData.source?.includes('Finnhub') ? 'live' : 'demo'}`}>
              <span className="status-pulse" style={{ background: stockData.source?.includes('Finnhub') ? 'var(--success)' : '#10b981' }}></span>
              {stockData.source || 'TradePulse Engine'}
            </span>
          </div>
          <p className="page-subtitle">
            {stockData.symbol} · {stockData.exchange || 'EQUITY'} · {stockData.category || 'General'} · Last update: {lastUpdated}
          </p>
        </div>

        <div className="detail-price-block">
          <p className="detail-price">
            {formatStockPrice(stockData.price, symbol)}
          </p>
          <p className={`detail-change ${isPos ? 'positive' : 'negative'}`}>
            {isPos ? '+' : ''}{currency}{stockData.change.toFixed(2)} ({isPos ? '+' : ''}{stockData.changePct.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Chart.js Line Chart */}
      <StockChart
        symbol={symbol}
        currentPrice={stockData.price}
        isPositive={isPos}
        isDark={isDark}
      />

      {/* Detail Stats and Quick Actions */}
      <div className="detail-grid" style={{ marginTop: '18px' }}>
        <div className="card">
          <h2 className="card-title-sm">Market Statistics</h2>
          <div className="stats-grid" style={{ marginTop: '14px' }}>
            <div className="stat-item">
              <span className="stat-label">Day High</span>
              <span className="stat-value">{formatStockPrice(stockData.high || stockData.price * 1.01, symbol)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Day Low</span>
              <span className="stat-value">{formatStockPrice(stockData.low || stockData.price * 0.99, symbol)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Open Price</span>
              <span className="stat-value">{formatStockPrice(stockData.open || stockData.price, symbol)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prev. Close</span>
              <span className="stat-value">{formatStockPrice(stockData.prevClose || stockData.price, symbol)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">52W High</span>
              <span className="stat-value">{stockData.high52 ? formatStockPrice(stockData.high52, symbol) : '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">52W Low</span>
              <span className="stat-value">{stockData.low52 ? formatStockPrice(stockData.low52, symbol) : '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">P/E Ratio</span>
              <span className="stat-value">{stockData.pe || '24.5'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">{stockData.marketCap || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title-sm">Quick Actions</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Execute simulated orders with zero financial risk using your virtual cash.
          </p>
          <div className="detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '9px 16px' }}
                onClick={() => onOpenTradeModal('buy', symbol)}
              >
                Buy Stock
              </button>
              {hasHolding && (
                <button
                  className="btn-sell btn-sell-lg"
                  style={{ flex: 1, padding: '9px 16px' }}
                  onClick={() => onOpenTradeModal('sell', symbol)}
                >
                  Sell Stock
                </button>
              )}
            </div>
            <button
              className="btn-outline"
              onClick={() => onToggleWatchlist(symbol)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Star size={14} fill={isWatched ? '#f59e0b' : 'none'} stroke={isWatched ? '#f59e0b' : 'currentColor'} />
              <span>{isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
            </button>
            <button
              className="btn-outline"
              onClick={() => onOpenAlertModal(symbol)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Bell size={14} />
              <span>Set Price Alert</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
