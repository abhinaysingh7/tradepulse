import React from 'react';
import { formatStockPrice } from '../services/stockApi';
import { TrendingUp, TrendingDown, Bell, ChevronRight, Wallet } from 'lucide-react';

export default function Dashboard({
  indices = [],
  portfolio = [],
  stocks = [],
  virtualCash = 50000,
  onNavigate,
  onSelectStock,
  alerts = []
}) {
  // Calculate portfolio totals
  let totalHoldingsValue = 0;
  let totalInvested = 0;
  let todayPnl = 0;

  portfolio.forEach(item => {
    const stock = stocks.find(s => s.symbol === item.symbol);
    const currentPrice = stock ? stock.price : item.avgPrice;
    const change = stock ? stock.change : 0;

    totalHoldingsValue += currentPrice * item.qty;
    totalInvested += item.avgPrice * item.qty;
    todayPnl += change * item.qty;
  });

  const totalPortfolioValue = totalHoldingsValue + virtualCash;
  const totalPnl = totalHoldingsValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Filter gainers and losers
  const sortedGainers = [...stocks]
    .filter(s => s.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5);

  const sortedLosers = [...stocks]
    .filter(s => s.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 5);

  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <section className="section active" id="dashboard">
      <div>
        <h1 className="page-title">Market Overview</h1>
        <p className="page-subtitle">Benchmark indices, portfolio performance, and market movers</p>
      </div>

      {triggeredAlerts.length > 0 && (
        <div className="alert-banner" style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={16} />
            <span>
              <strong>Price Alert Triggered:</strong> {triggeredAlerts.length} stock{triggeredAlerts.length > 1 ? 's have' : ' has'} reached target threshold.
            </span>
          </div>
          <button
            className="btn-outline"
            style={{ padding: '3px 10px', fontSize: '0.78rem' }}
            onClick={() => onNavigate('alerts')}
          >
            Review Alerts
          </button>
        </div>
      )}

      {/* Indices Grid */}
      <div className="indices-grid" id="indicesGrid" style={{ marginTop: '16px' }}>
        {indices.map(idx => {
          const isPos = idx.change >= 0;
          return (
            <div key={idx.id} className="index-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3>{idx.name}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {idx.currency === '₹' ? 'NSE' : 'INDEX'}
                </span>
              </div>
              <p className="index-value">
                {idx.currency || '$'}{idx.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isPos ? <TrendingUp size={13} className="positive" /> : <TrendingDown size={13} className="negative" />}
                <p className={`index-change ${isPos ? 'positive' : 'negative'}`}>
                  {isPos ? '+' : ''}{idx.change.toFixed(2)} ({isPos ? '+' : ''}{idx.changePct.toFixed(2)}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Main Grid */}
      <div className="dashboard-grid">
        {/* Portfolio Summary Card */}
        <div className="card portfolio-summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Portfolio Net Worth</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--surface-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
              Virtual Paper Account
            </span>
          </div>
          <p className="portfolio-value" id="portfolioValue" style={{ marginTop: '6px' }}>
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            {totalPnl >= 0 ? <TrendingUp size={14} className="positive" /> : <TrendingDown size={14} className="negative" />}
            <p className={`portfolio-change ${totalPnl >= 0 ? 'positive' : 'negative'}`} id="portfolioChange" style={{ margin: 0 }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
            </p>
          </div>

          <div className="summary-stats">
            <div>
              <span className="stat-label">Capital Invested</span>
              <span className="stat-value">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="stat-label">Today's P&amp;L</span>
              <span className={`stat-value ${todayPnl >= 0 ? 'positive' : 'negative'}`}>
                {todayPnl >= 0 ? '+' : ''}${todayPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="stat-label">Active Holdings</span>
              <span className="stat-value">{portfolio.length}</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={13} /> Available Cash
            </span>
            <strong style={{ color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
              ${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Top Gainers */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={15} style={{ color: 'var(--success)' }} /> Top Gainers
            </h2>
            <button
              className="link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}
              onClick={() => onNavigate('markets')}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="mini-stock-list" id="topGainers">
            {sortedGainers.map(s => (
              <div
                key={s.symbol}
                className="mini-stock clickable"
                onClick={() => onSelectStock(s.symbol)}
              >
                <div>
                  <p className="mini-stock-name">{s.name}</p>
                  <p className="mini-stock-symbol">{s.symbol} · {s.exchange || s.category}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mini-stock-price">{formatStockPrice(s.price, s.symbol)}</p>
                  <p className="mini-stock-change positive">+{s.changePct.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingDown size={15} style={{ color: 'var(--danger)' }} /> Top Losers
            </h2>
            <button
              className="link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}
              onClick={() => onNavigate('markets')}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="mini-stock-list" id="topLosers">
            {sortedLosers.map(s => (
              <div
                key={s.symbol}
                className="mini-stock clickable"
                onClick={() => onSelectStock(s.symbol)}
              >
                <div>
                  <p className="mini-stock-name">{s.name}</p>
                  <p className="mini-stock-symbol">{s.symbol} · {s.exchange || s.category}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mini-stock-price">{formatStockPrice(s.price, s.symbol)}</p>
                  <p className="mini-stock-change negative">{s.changePct.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
