import React, { useState, useEffect } from 'react';
import { checkServerHealth, fetchStockQuote, getApiBaseUrl } from '../services/stockApi';
import { X, RefreshCw, Server, RotateCcw, AlertTriangle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';

export default function ApiSettingsModal({ isOpen, onClose, onApiKeyUpdated, onResetDemo }) {
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

  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]');
  const currentTargetUrl = getApiBaseUrl() || (isLocalHost ? 'http://localhost:5001' : 'https://tradepulse-backend.onrender.com');

  const handleTestBackend = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    const health = await checkServerHealth();
    const effectiveTarget = health?.targetUrl || currentTargetUrl;

    if (health && health.status === 'ok') {
      setServerInfo(health);
      // Test quote through backend
      const quoteRes = await fetchStockQuote('AAPL');
      setIsTesting(false);
      if (quoteRes && !quoteRes.error) {
        setStatusMessage({
          type: 'success',
          text: `Backend active and connected! AAPL: $${quoteRes.price?.toFixed(2)} (${quoteRes.source})`
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: `Backend connected at ${effectiveTarget}. Upstream status: ${quoteRes?.error || 'Serving baseline market figures'}`
        });
      }
    } else {
      setIsTesting(false);
      setServerInfo(health && health.status === 'ok' ? health : null);
      if (isLocalHost) {
        setStatusMessage({
          type: 'error',
          text: `Unable to reach local backend at ${effectiveTarget}. Make sure "npm run server" is running on port 5001.`
        });
      } else {
        setStatusMessage({
          type: 'warning',
          text: `Render backend (${effectiveTarget}) is offline or waking up. Free-tier cloud instances spin down after inactivity and take ~30–50s to wake up on the first request. The dashboard automatically serves built-in baseline financial data while connecting.`
        });
      }
    }
  };

  const handleConfirmReset = () => {
    if (onResetDemo) {
      onResetDemo();
      setShowResetConfirm(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>System & API Settings</h2>
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
              TradePulse routes stock quotes and historical candle data securely through the Node.js + Express backend service.
            </p>

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
                <span style={{ color: 'var(--text-muted)' }}>Target Backend URL:</span>
                <code style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  {serverInfo?.targetUrl || currentTargetUrl}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Express Server:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: isTesting ? 'var(--primary)' : serverInfo ? 'var(--success)' : 'var(--danger)' }}>
                  {isTesting ? (
                    <>
                      <RefreshCw size={13} className="spin-anim" /> Waking up / Connecting...
                    </>
                  ) : serverInfo ? (
                    <>
                      <CheckCircle size={14} /> Online ({isLocalHost ? 'Port 5001' : (serverInfo.environment || 'Render Cloud')})
                    </>
                  ) : (
                    <>
                      <XCircle size={14} /> {isLocalHost ? 'Offline (Port 5001)' : 'Offline / Sleeping'}
                    </>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Server Finnhub Key:</span>
                <span style={{ fontWeight: 600, color: serverInfo?.hasFinnhubKey ? 'var(--success)' : serverInfo ? 'var(--text-muted)' : 'var(--text-muted)' }}>
                  {serverInfo ? (serverInfo.hasFinnhubKey ? 'Configured & Active' : 'Not Set (Using Baseline Data)') : 'Unknown (Server Offline / Sleeping)'}
                </span>
              </div>
            </div>

            {statusMessage && (
              <div style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                lineHeight: 1.45,
                background: statusMessage.type === 'success' ? 'var(--primary-light)' : statusMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.12)' : statusMessage.type === 'error' ? 'var(--danger-light)' : 'var(--surface-subtle)',
                color: statusMessage.type === 'success' ? 'var(--primary)' : statusMessage.type === 'warning' ? '#d97706' : statusMessage.type === 'error' ? 'var(--danger)' : 'var(--text)',
                border: statusMessage.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.25)' : 'none'
              }}>
                {statusMessage.text}
              </div>
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleTestBackend}
                disabled={isTesting}
              >
                <RefreshCw size={13} className={isTesting ? 'spin-anim' : ''} />
                <span>{isTesting ? 'Pinging Gateway...' : 'Ping Backend Health'}</span>
              </button>
            </div>

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
              <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
              <div>
                <strong style={{ color: 'var(--text)' }}>Cloud Hosting & Demo Mode:</strong> Render free services sleep after 15 minutes of inactivity and take ~30–50s to wake up on the first ping. If the server Finnhub key is unconfigured, TradePulse automatically serves realistic baseline market quotes and historical candlestick charts.
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
