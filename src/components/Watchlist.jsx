import React from 'react';
import { formatStockPrice, getStockCurrency } from '../services/stockApi';
import { Star, Plus, Bookmark } from 'lucide-react';

export default function Watchlist({
  watchlist = [],
  stocks = [],
  onSelectStock,
  onRemoveFromWatchlist,
  onOpenTradeModal,
  onNavigate
}) {
  const watchedStocks = watchlist.map(symbol => {
    return stocks.find(s => s.symbol === symbol) || {
      symbol,
      name: symbol,
      price: 100.00,
      change: 0.00,
      changePct: 0.00
    };
  });

  return (
    <section className="section active" id="watchlist">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="page-title">Watchlist</h1>
          <p className="page-subtitle">Tracked equities and personalized portfolio monitoring</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => onNavigate('markets')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Add Stocks from Markets
        </button>
      </div>

      {watchlist.length === 0 ? (
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
              <Bookmark size={20} />
            </div>
            <h3>Watchlist is currently empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '360px', margin: '4px auto 16px auto' }}>
              Star any stock from the Markets page to monitor its price fluctuations here.
            </p>
            <button className="btn-primary" onClick={() => onNavigate('markets')}>
              Browse Stock Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="watchlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {watchedStocks.map(stock => {
            const isPos = stock.changePct >= 0;
            return (
              <div key={stock.symbol} className="card watchlist-card" style={{ margin: 0, padding: '18px' }}>
                <div className="watchlist-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    className="clickable"
                    onClick={() => onSelectStock(stock.symbol)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '2px' }}>{stock.name}</h3>
                    <p className="symbol" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {stock.symbol} · {stock.exchange || 'EQUITY'}
                    </p>
                  </div>
                  <button
                    className="btn-star active"
                    onClick={() => onRemoveFromWatchlist(stock.symbol)}
                    title="Remove from watchlist"
                    aria-label="Remove from watchlist"
                  >
                    <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                  </button>
                </div>

                <div
                  className="clickable"
                  onClick={() => onSelectStock(stock.symbol)}
                  style={{ cursor: 'pointer', margin: '12px 0 8px 0' }}
                >
                  <p className="watchlist-price" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                    {formatStockPrice(stock.price, stock.symbol)}
                  </p>
                  <p className={`watchlist-change ${isPos ? 'positive' : 'negative'}`} style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    {isPos ? '+' : ''}{getStockCurrency(stock.symbol)}{stock.change.toFixed(2)} ({isPos ? '+' : ''}{stock.changePct.toFixed(2)}%)
                  </p>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-buy"
                    style={{ flex: 1, padding: '6px' }}
                    onClick={() => onOpenTradeModal('buy', stock.symbol)}
                  >
                    Buy
                  </button>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    View Chart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
