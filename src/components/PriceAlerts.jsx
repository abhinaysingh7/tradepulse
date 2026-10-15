import React, { useState } from 'react';
import { formatStockPrice, getStockCurrency } from '../services/stockApi';
import { Bell, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

export default function PriceAlerts({
  alerts = [],
  stocks = [],
  onAddAlert,
  onDeleteAlert,
  onSelectStock,
  preselectedSymbol
}) {
  const [selectedSymbol, setSelectedSymbol] = useState(preselectedSymbol || (stocks[0]?.symbol || 'AAPL'));
  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const [targetPrice, setTargetPrice] = useState(currentStock ? (currentStock.price * 1.02).toFixed(2) : '150');
  const [condition, setCondition] = useState('above'); // 'above' or 'below'

  const currency = getStockCurrency(selectedSymbol);

  // Update target price default if selected stock changes
  const handleStockChange = (sym) => {
    setSelectedSymbol(sym);
    const s = stocks.find(st => st.symbol === sym);
    if (s) {
      setTargetPrice((s.price * (condition === 'above' ? 1.02 : 0.98)).toFixed(2));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numPrice = parseFloat(targetPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Please enter a valid target price');
      return;
    }

    onAddAlert({
      symbol: selectedSymbol,
      targetPrice: numPrice,
      condition,
      stockName: currentStock?.name || selectedSymbol
    });
  };

  return (
    <section className="section active" id="alerts">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="page-title">Price Alerts</h1>
          <p className="page-subtitle">Configure real-time price threshold triggers for continuous market monitoring</p>
        </div>
        <div style={{
          padding: '4px 10px',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Bell size={13} /> Active in browser session
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '16px' }}>
        {/* Create Alert Card */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Create New Alert</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Select Stock
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => handleStockChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.85rem'
                }}
              >
                {stocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name} ({formatStockPrice(s.price, s.symbol)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Trigger Condition
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  className={`tab ${condition === 'above' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => {
                    setCondition('above');
                    if (currentStock) setTargetPrice((currentStock.price * 1.02).toFixed(2));
                  }}
                >
                  <TrendingUp size={14} /> Price Rises (&ge;)
                </button>
                <button
                  type="button"
                  className={`tab ${condition === 'below' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => {
                    setCondition('below');
                    if (currentStock) setTargetPrice((currentStock.price * 0.98).toFixed(2));
                  }}
                >
                  <TrendingDown size={14} /> Price Drops (&le;)
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Target Price ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Current Price: <strong>{formatStockPrice(currentStock?.price, selectedSymbol)}</strong>
              </span>
            </div>

            <button type="submit" className="btn-primary btn-full" style={{ marginTop: '18px', height: '38px' }}>
              Save Price Alert
            </button>
          </form>
        </div>

        {/* Active Alerts List Card */}
        <div className="card">
          <div className="card-header">
            <h2>Active Alerts ({alerts.length})</h2>
          </div>

          {alerts.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px', textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--surface-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '10px'
              }}>
                <Bell size={18} />
              </div>
              <h3>No price alerts configured</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Set a threshold on any stock to get notified when market prices move.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '6px' }}>
              {alerts.map(alert => {
                const stock = stocks.find(s => s.symbol === alert.symbol);
                const curPrice = stock ? stock.price : 0;
                const alertCurrency = getStockCurrency(alert.symbol);

                return (
                  <div key={alert.id} className="alert-item-card" style={{ padding: '12px 14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong
                          style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.92rem' }}
                          onClick={() => onSelectStock(alert.symbol)}
                        >
                          {alert.symbol}
                        </strong>
                        <span className={`badge ${alert.triggered ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                          {alert.triggered ? 'Triggered' : 'Monitoring'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', margin: '3px 0 0 0', color: 'var(--text-muted)' }}>
                        Trigger when price is {alert.condition === 'above' ? '≥' : '≤'} <strong>{alertCurrency}{alert.targetPrice.toFixed(2)}</strong>
                      </p>
                      <p style={{ fontSize: '0.75rem', margin: '2px 0 0 0', color: 'var(--text-muted)' }}>
                        Current Market: {formatStockPrice(curPrice, alert.symbol)}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn-outline"
                        style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--border)', display: 'inline-flex', alignItems: 'center' }}
                        onClick={() => onDeleteAlert(alert.id)}
                        title="Delete alert"
                        aria-label="Delete alert"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
