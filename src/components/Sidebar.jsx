import React from 'react';
import TradePulseLogo from './TradePulseLogo';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Bookmark,
  Bell,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

export default function Sidebar({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenSettings,
  alertsCount = 0
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'alerts', label: 'Price Alerts', icon: Bell, badge: alertsCount }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="logo">
        <TradePulseLogo size="md" />
      </div>

      <nav className="nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); onClose(); }}
            >
              <span className="nav-icon">
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar" id="userAvatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="user-name" id="userName" title={user?.name || 'Abhinay Singh'}>{user?.name || 'Abhinay Singh'}</p>
            <p className="user-id" id="userClientId">{user?.clientId || 'TradePulse User'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Settings & Data Configuration"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <SlidersHorizontal size={15} />
            </button>
          )}
          <button
            onClick={onLogout}
            title="Log out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
