import React from 'react';
import { formatStockPrice, getStockCurrency } from '../services/stockApi';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

export default function Portfolio({
  portfolio = [],
  stocks = [],
  virtualCash = 50000,
  onNavigate,
  onSelectStock,
  onOpenTradeModal
}) {
  let totalHoldingsValue = 0;
  let totalInvested = 0;
  let totalProfitLoss = 0;

  const holdingsWithMetrics = portfolio.map(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol) || {
      symbol: holding.symbol,
      name: holding.symbol,
      price: holding.avgPrice,
      change: 0,
      changePct: 0
    };

    const currentValue = stock.price * holding.qty;
    const invested = holding.avgPrice * holding.qty;
    const pnl = currentValue - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

    totalHoldingsValue += currentValue;
    totalInvested += invested;
    totalProfitLoss += pnl;

    return {
      ...holding,
      stockName: stock.name,
      exchange: stock.exchange,
      currentPrice: stock.price,
      currentValue,
      invested,
      pnl,
      pnlPct
    };
  });

  const totalReturnPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const netWorth = totalHoldingsValue + virtualCash;

  return (
    <section className="section active" id="portfolio">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Holdings breakdown, realized &amp; unrealized performance, and virtual balance</p>
        </div>
        <div style={{
          padding: '4px 10px',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontWeight: 500
        }}>
          Paper Trading Session
        </div>
      </div>

      {/* Summary Cards */}
      <div className="indices-grid" style={{ marginTop: '16px' }}>
        <div className="index-card">
          <h3>Total Net Worth</h3>
          <p className="index-value">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="stat-label">Holdings + Available Cash</p>
        </div>
        <div className="index-card">
          <h3>Holdings Valuation</h3>
          <p className="index-value">${totalHoldingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="stat-label">Invested: ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="index-card">
          <h3>Total P&amp;L</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {totalProfitLoss >= 0 ? <TrendingUp size={16} className="positive" /> : <TrendingDown size={16} className="negative" />}
            <p className={`index-value ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`} style={{ margin: 0 }}>
              {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className={`stat-label ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`} style={{ fontWeight: 600, marginTop: '4px' }}>
            {totalProfitLoss >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}% Overall
          </p>
        </div>
        <div className="index-card">
          <h3>Available Cash</h3>
          <p className="index-value" style={{ color: 'var(--primary)' }}>
            ${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="stat-label">Unallocated balance</p>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '12px'
            }}>
              <Briefcase size={20} />
            </div>
            <h3>No active positions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '360px', margin: '4px auto 16px auto' }}>
              Execute paper buy orders from the Markets catalog to build your portfolio.
            </p>
            <button className="btn-primary" onClick={() => onNavigate('markets')}>
              Explore Markets
            </button>
          </div>
        </div>
      ) : (
        <div className="card stock-table-card" style={{ marginTop: '16px' }}>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Avg Price</th>
                <th style={{ textAlign: 'right' }}>Current Price</th>
                <th style={{ textAlign: 'right' }}>Valuation</th>
                <th style={{ textAlign: 'right' }}>P&amp;L</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdingsWithMetrics.map(holding => {
                const isPos = holding.pnl >= 0;
                return (
                  <tr key={holding.symbol}>
                    <td
                      className="stock-name-cell clickable"
                      onClick={() => onSelectStock(holding.symbol)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>{holding.stockName}</strong>
                        {holding.exchange && (
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'var(--surface-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            fontWeight: 600
                          }}>
                            {holding.exchange}
                          </span>
                        )}
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{holding.symbol}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{holding.qty}</td>
                    <td style={{ textAlign: 'right' }}>{formatStockPrice(holding.avgPrice, holding.symbol)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatStockPrice(holding.currentPrice, holding.symbol)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatStockPrice(holding.currentValue, holding.symbol)}</td>
                    <td style={{ textAlign: 'right' }} className={isPos ? 'positive' : 'negative'}>
                      <div>{isPos ? '+' : ''}{getStockCurrency(holding.symbol)}{holding.pnl.toFixed(2)}</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>({isPos ? '+' : ''}{holding.pnlPct.toFixed(2)}%)</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-buy"
                          onClick={() => onOpenTradeModal('buy', holding.symbol)}
                        >
                          Buy More
                        </button>
                        <button
                          className="btn-sell"
                          onClick={() => onOpenTradeModal('sell', holding.symbol)}
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
