import React, { useState } from 'react';
import { Search, Moon, Sun, Menu, Wallet } from 'lucide-react';
import { formatStockPrice } from '../services/stockApi';

export default function Topbar({
  onToggleSidebar,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  stocks = [],
  onSelectStock,
  virtualCash
}) {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const filteredSuggestions = searchQuery.trim().length > 0
    ? stocks.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelect = (symbol) => {
    onSelectStock(symbol);
    setShowSearchDropdown(false);
  };

  return (
    <header className="topbar">
      <button
        className="menu-toggle"
        id="menuToggle"
        aria-label="Toggle menu"
        onClick={onToggleSidebar}
      >
        <Menu size={18} />
      </button>

      {/* Search Bar */}
      <div className="search-box">
        <span className="search-icon">
          <Search size={15} />
        </span>
        <input
          type="text"
          id="globalSearch"
          placeholder="Search 35+ stocks (e.g. AAPL, NVDA, RELIANCE, TCS)..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          onBlur={() => setTimeout(() => setShowSearchDropdown(false), 220)}
        />

        {showSearchDropdown && filteredSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {filteredSuggestions.map(s => (
              <div
                key={s.symbol}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)'
                }}
                onMouseDown={() => handleSelect(s.symbol)}
                className="clickable-item"
              >
                <div>
                  <strong style={{ fontSize: '0.88rem' }}>{s.symbol}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {s.name} · {s.exchange || s.category}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formatStockPrice(s.price, s.symbol)}</div>
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    color: s.changePct >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topbar Actions: Clean & Uncluttered */}
      <div className="topbar-actions">
        {virtualCash !== undefined && (
          <div className="cash-pill" title="Virtual Demo Trading Balance">
            <Wallet size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Virtual Cash</span>
            <strong>${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        )}

        <button
          className="theme-toggle"
          id="themeToggle"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
