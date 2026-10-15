import React, { useState } from 'react';
import { formatStockPrice, getStockCurrency } from '../services/stockApi';
import { RefreshCw, Star, Bell, Search } from 'lucide-react';

export default function Markets({
  stocks = [],
  watchlist = [],
  portfolio = [],
  onSelectStock,
  onOpenTradeModal,
  onToggleWatchlist,
  onOpenAlertModal,
  onRefreshQuotes,
  isRefreshing
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Filter stocks
  let filtered = [...stocks];

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  switch (filter) {
    case 'gainers':
      filtered = filtered.filter(s => s.changePct > 0).sort((a, b) => b.changePct - a.changePct);
      break;
    case 'losers':
      filtered = filtered.filter(s => s.changePct < 0).sort((a, b) => a.changePct - b.changePct);
      break;
    case 'tech':
      filtered = filtered.filter(s => s.category === 'Tech' || s.category === 'IT Services');
      break;
    case 'finance':
      filtered = filtered.filter(s => s.category === 'Finance');
      break;
    default:
      break;
  }

  return (
    <section className="section active" id="markets">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Markets</h1>
          <p className="page-subtitle">Real-time stock catalog across US Tech, Global Equities, and Indian NSE stocks</p>
        </div>
        <button
          className="btn-outline"
          onClick={onRefreshQuotes}
          disabled={isRefreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin-anim' : ''} />
          <span>{isRefreshing ? 'Updating quotes...' : 'Refresh Quotes'}</span>
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
        <div className="tabs" id="marketTabs">
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All Stocks ({stocks.length})
          </button>
          <button className={`tab ${filter === 'gainers' ? 'active' : ''}`} onClick={() => setFilter('gainers')}>
            Top Gainers
          </button>
          <button className={`tab ${filter === 'losers' ? 'active' : ''}`} onClick={() => setFilter('losers')}>
            Top Losers
          </button>
          <button className={`tab ${filter === 'tech' ? 'active' : ''}`} onClick={() => setFilter('tech')}>
            Tech &amp; IT
          </button>
          <button className={`tab ${filter === 'finance' ? 'active' : ''}`} onClick={() => setFilter('finance')}>
            Finance &amp; Banking
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              paddingLeft: '32px',
              paddingRight: '10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.82rem'
            }}
          />
        </div>
      </div>

      <div className="card stock-table-card" style={{ marginTop: '14px' }}>
        <table className="stock-table">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Company</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Change</th>
              <th style={{ textAlign: 'right' }}>% Change</th>
              <th style={{ textAlign: 'right' }}>Volume</th>
              <th style={{ textAlign: 'center' }}>Sector</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No stocks matching "{search}"
                </td>
              </tr>
            ) : (
              filtered.map(stock => {
                const isPos = stock.changePct >= 0;
                const isWatched = watchlist.includes(stock.symbol);
                const hasHolding = portfolio.some(h => h.symbol === stock.symbol);

                return (
                  <tr key={stock.symbol}>
                    <td
                      className="stock-name-cell clickable"
                      onClick={() => onSelectStock(stock.symbol)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{stock.name}</strong>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'var(--surface-subtle)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          fontWeight: 600
                        }}>
                          {stock.exchange || 'EQUITY'}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{stock.symbol}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatStockPrice(stock.price, stock.symbol)}
                    </td>
                    <td style={{ textAlign: 'right' }} className={isPos ? 'positive' : 'negative'}>
                      {isPos ? '+' : ''}{getStockCurrency(stock.symbol)}{stock.change.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }} className={isPos ? 'positive' : 'negative'}>
                      {isPos ? '+' : ''}{stock.changePct.toFixed(2)}%
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {stock.volume || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'var(--surface-subtle)',
                        color: 'var(--text-muted)'
                      }}>
                        {stock.category || 'General'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className={`btn-star ${isWatched ? 'active' : ''}`}
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                          aria-label="Toggle watchlist"
                        >
                          <Star size={13} fill={isWatched ? '#f59e0b' : 'none'} stroke={isWatched ? '#f59e0b' : 'currentColor'} />
                        </button>
                        <button
                          className="btn-buy"
                          onClick={() => onOpenTradeModal('buy', stock.symbol)}
                        >
                          Buy
                        </button>
                        {hasHolding && (
                          <button
                            className="btn-sell"
                            onClick={() => onOpenTradeModal('sell', stock.symbol)}
                          >
                            Sell
                          </button>
                        )}
                        <button
                          className="btn-outline"
                          style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => onOpenAlertModal(stock.symbol)}
                          title="Set Price Alert"
                        >
                          <Bell size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
