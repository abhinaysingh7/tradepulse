import React, { useState, useEffect } from 'react';
import { formatStockPrice, getStockCurrency } from '../services/stockApi';
import { AlertCircle, X } from 'lucide-react';

export default function TradeModal({
  isOpen,
  onClose,
  mode = 'buy', // 'buy' or 'sell'
  symbol,
  stocks = [],
  portfolio = [],
  virtualCash = 50000,
  onExecuteTrade
}) {
  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [errorMsg, setErrorMsg] = useState('');

  const stock = stocks.find(s => s.symbol === symbol);
  const holding = portfolio.find(h => h.symbol === symbol);
  const currentPrice = stock ? stock.price : 100.00;
  const estimatedTotal = (parseFloat(qty) || 0) * currentPrice;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setErrorMsg('');
    }
  }, [isOpen, symbol, mode]);

  if (!isOpen || !stock) return null;

  const maxSellQty = holding ? holding.qty : 0;

  const handleConfirm = () => {
    const quantity = parseInt(qty, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setErrorMsg('Please enter a valid quantity of at least 1');
      return;
    }

    if (mode === 'buy') {
      if (estimatedTotal > virtualCash) {
        setErrorMsg(`Insufficient virtual cash. Need $${estimatedTotal.toFixed(2)}, have $${virtualCash.toFixed(2)}`);
        return;
      }
    } else {
      if (quantity > maxSellQty) {
        setErrorMsg(`Cannot sell more shares than owned. You hold ${maxSellQty} shares.`);
        return;
      }
    }

    onExecuteTrade({
      mode,
      symbol,
      qty: quantity,
      price: currentPrice
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{mode === 'buy' ? 'Execute Buy Order (Paper)' : 'Execute Sell Order (Paper)'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-stock-info">
            <div>
              <h3>{stock.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {stock.symbol} · {stock.exchange || 'EQUITY'} · Simulated Trade
              </p>
            </div>
            <p className="modal-stock-price">{formatStockPrice(currentPrice, symbol)}</p>
          </div>

          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tradeQty">
              Quantity {mode === 'sell' && `(Holdings: ${maxSellQty} shares)`}
            </label>
            <input
              type="number"
              id="tradeQty"
              min="1"
              max={mode === 'sell' ? maxSellQty : undefined}
              value={qty}
              onChange={(e) => {
                setQty(e.target.value);
                setErrorMsg('');
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Order Execution</label>
            <div className="order-types" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className={`order-type ${orderType === 'market' ? 'active' : ''}`}
                style={{ flex: 1, padding: '7px' }}
                onClick={() => setOrderType('market')}
              >
                Market (Instant)
              </button>
              <button
                type="button"
                className={`order-type ${orderType === 'limit' ? 'active' : ''}`}
                style={{ flex: 1, padding: '7px' }}
                onClick={() => setOrderType('limit')}
              >
                Limit
              </button>
            </div>
          </div>

          <div className="trade-summary" style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Estimated Total:</span>
              <strong style={{ fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                {getStockCurrency(symbol)}{estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Virtual Cash Available:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                ${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn-primary ${mode === 'sell' ? 'btn-sell' : ''}`}
            onClick={handleConfirm}
          >
            {mode === 'buy' ? 'Confirm Buy' : 'Confirm Sell'}
          </button>
        </div>
      </div>
    </div>
  );
}
