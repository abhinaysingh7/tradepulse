import React, { useState, useEffect } from 'react';
import { checkServerHealth, fetchStockQuote } from '../services/stockApi';
import { X, RefreshCw, Server, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

  const handleTestBackend = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    const health = await checkServerHealth();
    if (health && health.status === 'ok') {
      setServerInfo(health);
      // Now test quote through backend
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
          text: `Backend connected. Upstream: ${quoteRes?.error || 'Operating in demo mode'}`
        });
      }
    } else {
      setIsTesting(false);
      setServerInfo(null);
      setStatusMessage({
        type: 'error',
        text: 'Unable to reach backend server. Make sure "npm run server" is running on port 5000.'
      });
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
      <div className="modal" style={{ maxWidth: '480px' }}>
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
              TradePulse routes all stock quotes and candle data securely through the Node.js + Express backend service.
            </p>

            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Express Server:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: serverInfo ? 'var(--success)' : 'var(--danger)' }}>
                  {serverInfo ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {serverInfo ? 'Online (Port 5000)' : 'Offline / Unreachable'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Server Finnhub Key:</span>
                <span style={{ fontWeight: 600, color: serverInfo?.hasFinnhubKey ? 'var(--success)' : 'var(--text-muted)' }}>
                  {serverInfo?.hasFinnhubKey ? 'Configured & Active' : 'Not Set (Using Baseline Data)'}
                </span>
              </div>
            </div>

            {statusMessage && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                background: statusMessage.type === 'success' ? 'var(--primary-light)' : statusMessage.type === 'error' ? 'var(--danger-light)' : 'var(--surface-subtle)',
                color: statusMessage.type === 'success' ? 'var(--primary)' : statusMessage.type === 'error' ? 'var(--danger)' : 'var(--text)'
              }}>
                {statusMessage.text}
              </div>
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleTestBackend}
                disabled={isTesting}
              >
                <RefreshCw size={13} className={isTesting ? 'spin-anim' : ''} />
                <span>{isTesting ? 'Verifying Gateway...' : 'Ping Backend Health'}</span>
              </button>
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
