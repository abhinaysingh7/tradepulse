import React, { useState, useEffect } from 'react';
import { checkServerHealth, fetchStockQuote, getApiBaseUrl } from '../services/stockApi';
import { X, RefreshCw, Server, RotateCcw, AlertTriangle, CheckCircle, Info, ExternalLink, Zap, Check } from 'lucide-react';

export default function ApiSettingsModal({ isOpen, onClose, onApiKeyUpdated, onResetDemo }) {
  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]');

  const [gatewayMode, setGatewayMode] = useState(() => {
    return localStorage.getItem('tradepulse_gateway_mode') || (isLocalHost ? 'local' : 'cloud');
  });

  const [customUrlInput, setCustomUrlInput] = useState(() => {
    return localStorage.getItem('tradepulse_backend_url') || '';
  });

  const [serverInfo, setServerInfo] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleTestBackend();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resolveTargetUrl = (mode, customVal) => {
    if (mode === 'standalone') return 'standalone';
    if (mode === 'local') return 'http://localhost:5001';
    if (mode === 'custom') return customVal?.trim() || 'http://localhost:5001';
    return 'https://tradepulse-backend.onrender.com';
  };

  const handleTestBackend = async (targetOverride) => {
    setIsTesting(true);
    setStatusMessage(null);

    const activeTarget = targetOverride !== undefined ? targetOverride : resolveTargetUrl(gatewayMode, customUrlInput);
    const health = await checkServerHealth(activeTarget);

    setIsTesting(false);
    setServerInfo(health);

    if (activeTarget === 'standalone' || health?.isStandalone) {
      setStatusMessage({
        type: 'success',
        text: 'Built-in Autonomous Market Engine is active. 36 curated equities, Chart.js visual analytics, and virtual trading are 100% operational in-browser.'
      });
      return;
    }

    if (health && health.status === 'ok') {
      const quoteRes = await fetchStockQuote('AAPL');
      if (quoteRes && !quoteRes.error) {
        setStatusMessage({
          type: 'success',
          text: `Backend connected successfully to ${health.targetUrl}! AAPL: $${quoteRes.price?.toFixed(2)} (${quoteRes.source})`
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: `Connected to ${health.targetUrl}. Using financial baseline data: ${quoteRes?.error || 'Serving realistic simulated quotes'}`
        });
      }
    } else {
      if (isLocalHost && gatewayMode === 'local') {
        setStatusMessage({
          type: 'info',
          text: `Local server not detected at ${health?.targetUrl || 'http://localhost:5001'}. Run "npm run server" in your terminal to start it, or switch to Standalone Engine.`
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: `Cloud backend at ${health?.targetUrl || 'https://tradepulse-backend.onrender.com'} is in standby or waking up. TradePulse's autonomous financial engine is seamlessly handling all market quotes and charts.`
        });
      }
    }
  };

  const handleModeChange = (mode) => {
    setGatewayMode(mode);
    localStorage.setItem('tradepulse_gateway_mode', mode);

    let target = '';
    if (mode === 'standalone') {
      target = 'standalone';
    } else if (mode === 'local') {
      target = 'http://localhost:5001';
    } else if (mode === 'custom') {
      target = customUrlInput.trim() || 'http://localhost:5001';
    } else {
      target = 'https://tradepulse-backend.onrender.com';
    }

    if (mode === 'custom' || mode === 'standalone') {
      localStorage.setItem('tradepulse_backend_url', target);
    } else {
      localStorage.removeItem('tradepulse_backend_url');
    }

    handleTestBackend(target);
  };

  const handleSaveCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    localStorage.setItem('tradepulse_backend_url', customUrlInput.trim());
    handleTestBackend(customUrlInput.trim());
  };

  const handleConfirmReset = () => {
    if (onResetDemo) {
      onResetDemo();
      setShowResetConfirm(false);
      onClose();
    }
  };

  const currentEffectiveTarget = resolveTargetUrl(gatewayMode, customUrlInput);
  const isStandAlone = gatewayMode === 'standalone' || currentEffectiveTarget === 'standalone';
  const isOnline = serverInfo && serverInfo.status === 'ok';

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2>System & API Settings</h2>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--primary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
              All Systems Operational
            </span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: Backend Gateway & Health */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Server size={14} style={{ color: 'var(--primary)' }} /> Backend API Gateway
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              TradePulse connects to an Express backend relay or runs completely autonomously with its built-in market simulation engine.
            </p>

            {/* Mode Selector Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              background: 'var(--surface-subtle)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '12px',
              fontSize: '0.75rem'
            }}>
              {[
                { id: 'cloud', label: 'Cloud Relay' },
                { id: 'local', label: 'Localhost' },
                { id: 'standalone', label: 'Standalone' },
                { id: 'custom', label: 'Custom URL' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleModeChange(tab.id)}
                  style={{
                    padding: '6px 4px',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: gatewayMode === tab.id ? 600 : 500,
                    background: gatewayMode === tab.id ? 'var(--surface)' : 'transparent',
                    color: gatewayMode === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: gatewayMode === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Custom URL Input if Custom mode active */}
            {gatewayMode === 'custom' && (
              <form onSubmit={handleSaveCustomUrl} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="url"
                  placeholder="https://your-backend.onrender.com"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)'
                  }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  Save & Test
                </button>
              </form>
            )}

            {/* Status Breakdown Box */}
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Gateway:</span>
                <code style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  {isStandAlone ? 'Built-in Autonomous Engine' : (serverInfo?.targetUrl || currentEffectiveTarget)}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Express Server:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: isTesting ? 'var(--primary)' : isOnline ? 'var(--success)' : 'var(--text)' }}>
                  {isTesting ? (
                    <>
                      <RefreshCw size={13} className="spin-anim" /> Verifying Gateway...
                    </>
                  ) : isOnline ? (
                    <>
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Online ({isLocalHost ? 'Port 5001' : (serverInfo?.environment || 'Active')})
                    </>
                  ) : isStandAlone ? (
                    <>
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Built-in Standalone Engine (Active)
                    </>
                  ) : (
                    <>
                      <Info size={14} style={{ color: 'var(--primary)' }} /> Standby (Autonomous Fallback Active)
                    </>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Market Data Engine:</span>
                <span style={{ fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={14} />
                  {serverInfo?.hasFinnhubKey ? 'Live Finnhub Feed (Real-Time API)' : 'Autonomous Market Engine (36 Stocks Active)'}
                </span>
              </div>
            </div>

            {/* Informational Status Banner */}
            {statusMessage && (
              <div style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                lineHeight: 1.45,
                background: statusMessage.type === 'success' ? 'var(--primary-light)' : 'rgba(5, 150, 105, 0.08)',
                color: 'var(--primary-dark, #065f46)',
                border: '1px solid rgba(5, 150, 105, 0.2)'
              }}>
                {statusMessage.text}
              </div>
            )}

            {/* Action Buttons: Ping & 1-Click Render Deploy */}
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => handleTestBackend()}
                disabled={isTesting}
              >
                <RefreshCw size={13} className={isTesting ? 'spin-anim' : ''} />
                <span>{isTesting ? 'Pinging Gateway...' : 'Test Connection'}</span>
              </button>

              <a
                href="https://render.com/deploy?repo=https://github.com/abhinaysingh7/tradepulse"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Deploy to Render (Free)</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Free Hosting Explanatory Card */}
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              display: 'flex',
              gap: '8px'
            }}>
              <Zap size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
              <div>
                <strong style={{ color: 'var(--text)' }}>Zero-Downtime Architecture:</strong> If the cloud backend is in standby or if the Finnhub API key is omitted, TradePulse automatically serves realistic baseline market quotes, technical indicators, and historical candlestick charts with zero interruption.
              </div>
            </div>
          </div>

          {/* Section 2: Demo Management & Reset */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} /> Demo Data Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Restore original paper trading portfolio, starter watchlist, and default $50,000 balance.
            </p>

            {showResetConfirm ? (
              <div style={{
                padding: '12px',
                background: 'var(--danger-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(244, 63, 94, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  <AlertTriangle size={15} /> Confirm Reset Demo Data?
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  This will reset all your portfolio holdings, cash balance, and active price alerts.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-sell"
                    style={{ flex: 1, padding: '6px 12px' }}
                    onClick={handleConfirmReset}
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, padding: '6px 12px' }}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setShowResetConfirm(true)}
              >
                Reset Demo to Initial State...
              </button>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
