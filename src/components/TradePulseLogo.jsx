import React from 'react';

export default function TradePulseLogo({ size = 'md', showText = true, className = '' }) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40
  };

  const textSizes = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem'
  };

  const px = iconSizes[size] || 32;

  return (
    <div className={`tradepulse-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background rounded tile */}
        <rect width="36" height="36" rx="9" fill="var(--logo-bg, #0f231e)" />
        <rect x="0.5" y="0.5" width="35" height="35" rx="8.5" stroke="var(--logo-border, #134e42)" strokeOpacity="0.6" />

        {/* Minimalist pulse / candlestick line */}
        <path
          d="M8 23L14 16L19 20L28 10"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Accent upward beacon */}
        <circle cx="28" cy="10" r="2.2" fill="#34d399" />

        {/* Subtle trend base indicator */}
        <rect x="13.2" y="24" width="1.6" height="4" rx="0.8" fill="#10b981" fillOpacity="0.4" />
        <rect x="18.2" y="24" width="1.6" height="5" rx="0.8" fill="#10b981" fillOpacity="0.4" />
        <rect x="23.2" y="16" width="1.6" height="13" rx="0.8" fill="#10b981" fillOpacity="0.4" />
      </svg>

      {showText && (
        <span
          className="logo-wordmark"
          style={{
            fontSize: textSizes[size] || '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}
        >
          <span style={{ color: 'var(--text)' }}>Trade</span>
          <span style={{ color: '#10b981', marginLeft: '1px' }}>Pulse</span>
        </span>
      )}
    </div>
  );
}
