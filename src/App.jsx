import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Markets from './components/Markets';
import Portfolio from './components/Portfolio';
import Watchlist from './components/Watchlist';
import StockDetail from './components/StockDetail';
import PriceAlerts from './components/PriceAlerts';
import TradeModal from './components/TradeModal';
import ApiSettingsModal from './components/ApiSettingsModal';
import Login from './components/Login';

import {
  INDICES,
  INITIAL_STOCKS,
  DEFAULT_PORTFOLIO,
  DEFAULT_WATCHLIST,
  INITIAL_CASH_BALANCE
} from './data/stocksData';
import { fetchStockQuote, getApiKey } from './services/stockApi';

export default function App() {
  // ─── Authentication State ───
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('tradepulse_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default demo session for immediate preview
    return { name: 'Ankit Sharma', email: 'demo@tradepulse.com', clientId: 'TP1024' };
  });

  // ─── Theme State ───
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tradepulse_theme') || 'light';
  });

  // ─── Navigation State ───
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [previousSection, setPreviousSection] = useState('markets');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Search State ───
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Data States ───
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('tradepulse_stocks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_STOCKS;
  });

  const [indices] = useState(INDICES);

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('tradepulse_portfolio');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_PORTFOLIO;
  });

  const [virtualCash, setVirtualCash] = useState(() => {
    const saved = localStorage.getItem('tradepulse_virtual_cash');
    if (saved !== null) {
      const val = parseFloat(saved);
      if (!isNaN(val)) return val;
    }
    return INITIAL_CASH_BALANCE;
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('tradepulse_watchlist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_WATCHLIST;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('tradepulse_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'alert-1', symbol: 'NVDA', targetPrice: 140.00, condition: 'above', triggered: false, createdAt: Date.now() },
      { id: 'alert-2', symbol: 'TSLA', targetPrice: 200.00, condition: 'below', triggered: false, createdAt: Date.now() }
    ];
  });

  // ─── Modals and Toast State ───
  const [tradeModal, setTradeModal] = useState({ isOpen: false, mode: 'buy', symbol: 'AAPL' });
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState({ isRealData: true, source: 'Finnhub API' });

  // ─── Show Toast Helper ───
  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3500);
  }, []);

  // ─── Apply Theme Effect ───
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tradepulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // ─── Persist State Effects ───
  useEffect(() => {
    localStorage.setItem('tradepulse_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('tradepulse_virtual_cash', virtualCash.toString());
  }, [virtualCash]);

  useEffect(() => {
    localStorage.setItem('tradepulse_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('tradepulse_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('tradepulse_stocks', JSON.stringify(stocks));
  }, [stocks]);

  // ─── Price Alert Evaluation ───
  const checkAlerts = useCallback((currentStocks) => {
    setAlerts(prevAlerts => {
      let changed = false;
      const updated = prevAlerts.map(alert => {
        if (alert.triggered) return alert;

        const stock = currentStocks.find(s => s.symbol === alert.symbol);
        if (!stock) return alert;

        let shouldTrigger = false;
        if (alert.condition === 'above' && stock.price >= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'below' && stock.price <= alert.targetPrice) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          changed = true;
          showToast(`Price Alert: ${alert.symbol} reached target $${alert.targetPrice.toFixed(2)} (Current: $${stock.price.toFixed(2)})`);
          return { ...alert, triggered: true, triggeredAt: Date.now() };
        }
        return alert;
      });

      return changed ? updated : prevAlerts;
    });
  }, [showToast]);

  // ─── Update Single Stock Quote ───
  const handleUpdateQuote = useCallback((quote) => {
    if (!quote || !quote.symbol) return;
    setStocks(prev => {
      const idx = prev.findIndex(s => s.symbol === quote.symbol);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...quote };
      } else {
        updated = [...prev, {
          symbol: quote.symbol,
          name: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePct: quote.changePct,
          volume: '1.2M',
          source: quote.source
        }];
      }
      checkAlerts(updated);
      return updated;
    });
  }, [checkAlerts]);

  // ─── Fetch Real API Quotes on Start and Refresh ───
  const refreshQuotes = useCallback(async () => {
    setIsRefreshing(true);
    let successCount = 0;

    // Fetch primary focus stocks to stay within free API rate limits (60/min)
    const prioritySymbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA'];

    for (const sym of prioritySymbols) {
      try {
        const quote = await fetchStockQuote(sym);
        if (quote && !quote.error && quote.price) {
          handleUpdateQuote(quote);
          successCount++;
        }
      } catch (e) {
        console.warn(`Failed to fetch quote for ${sym}:`, e);
      }
    }

    setIsRefreshing(false);
    if (successCount > 0) {
      setApiStatus({ isRealData: true, source: 'Finnhub Live' });
      showToast(`Updated ${successCount} stock quotes from Finnhub API`);
    } else {
      setApiStatus({ isRealData: false, source: 'Demo Mode' });
      showToast('API quota or offline: using baseline figures');
    }
  }, [handleUpdateQuote, showToast]);

  useEffect(() => {
    // Initial fetch on app start
    refreshQuotes();
  }, []);

  // ─── Navigation Handlers ───
  const handleNavigate = (section) => {
    if (section !== 'detail') {
      setPreviousSection(section);
    }
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setCurrentSection('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Watchlist Handlers ───
  const handleToggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      const exists = prev.includes(symbol);
      if (exists) {
        showToast(`Removed ${symbol} from Watchlist`);
        return prev.filter(s => s !== symbol);
      } else {
        showToast(`Added ${symbol} to Watchlist`);
        return [...prev, symbol];
      }
    });
  };

  // ─── Alerts Handlers ───
  const handleAddAlert = (newAlert) => {
    const alertObj = {
      id: 'alert-' + Date.now(),
      symbol: newAlert.symbol,
      targetPrice: newAlert.targetPrice,
      condition: newAlert.condition,
      triggered: false,
      createdAt: Date.now()
    };
    setAlerts(prev => [alertObj, ...prev]);
    showToast(`Alert set for ${newAlert.symbol} at $${newAlert.targetPrice.toFixed(2)}`);

    // Immediately test condition
    const stock = stocks.find(s => s.symbol === newAlert.symbol);
    if (stock) {
      if (
        (newAlert.condition === 'above' && stock.price >= newAlert.targetPrice) ||
        (newAlert.condition === 'below' && stock.price <= newAlert.targetPrice)
      ) {
        setTimeout(() => {
          checkAlerts(stocks);
        }, 500);
      }
    }
  };

  const handleDeleteAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert deleted');
  };

  const handleOpenAlertModal = (symbol) => {
    setSelectedStock(symbol);
    handleNavigate('alerts');
  };

  // ─── Virtual Trading Execution ───
  const handleOpenTradeModal = (mode, symbol) => {
    setTradeModal({ isOpen: true, mode, symbol });
  };

  const handleExecuteTrade = ({ mode, symbol, qty, price }) => {
    const totalCost = qty * price;

    if (mode === 'buy') {
      if (totalCost > virtualCash) {
        showToast('Insufficient virtual cash to execute buy order');
        return;
      }

      setVirtualCash(prev => prev - totalCost);

      setPortfolio(prev => {
        const existing = prev.find(h => h.symbol === symbol);
        if (existing) {
          const totalQty = existing.qty + qty;
          const weightedAvg = ((existing.avgPrice * existing.qty) + totalCost) / totalQty;
          return prev.map(h => h.symbol === symbol ? { ...h, qty: totalQty, avgPrice: weightedAvg } : h);
        } else {
          return [...prev, { symbol, qty, avgPrice: price }];
        }
      });

      showToast(`Bought ${qty} shares of ${symbol} for $${totalCost.toFixed(2)} (Simulated)`);
    } else {
      const holding = portfolio.find(h => h.symbol === symbol);
      if (!holding || holding.qty < qty) {
        showToast('Insufficient holdings to sell');
        return;
      }

      setVirtualCash(prev => prev + totalCost);

      setPortfolio(prev => {
        return prev
          .map(h => {
            if (h.symbol === symbol) {
              return { ...h, qty: h.qty - qty };
            }
            return h;
          })
          .filter(h => h.qty > 0);
      });

      showToast(`Sold ${qty} shares of ${symbol} for $${totalCost.toFixed(2)} (Simulated)`);
    }
  };

  // ─── Reset Demo ───
  const handleResetDemo = () => {
    localStorage.removeItem('tradepulse_portfolio');
    localStorage.removeItem('tradepulse_virtual_cash');
    localStorage.removeItem('tradepulse_watchlist');
    localStorage.removeItem('tradepulse_alerts');
    localStorage.removeItem('tradepulse_stocks');

    setPortfolio(DEFAULT_PORTFOLIO);
    setVirtualCash(INITIAL_CASH_BALANCE);
    setWatchlist(DEFAULT_WATCHLIST);
    setStocks(INITIAL_STOCKS);
    setAlerts([
      { id: 'alert-1', symbol: 'NVDA', targetPrice: 140.00, condition: 'above', triggered: false, createdAt: Date.now() },
      { id: 'alert-2', symbol: 'TSLA', targetPrice: 200.00, condition: 'below', triggered: false, createdAt: Date.now() }
    ]);
    showToast('Demo data and portfolio reset successfully');
  };

  // ─── Logout ───
  const handleLogout = () => {
    localStorage.removeItem('tradepulse_session');
    setSession(null);
  };

  if (!session) {
    return <Login onLoginSuccess={(sess) => setSession(sess)} />;
  }

  const activeAlertsCount = alerts.filter(a => !a.triggered).length;

  return (
    <div className="app">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={session}
        onLogout={handleLogout}
        alertsCount={activeAlertsCount}
        onOpenSettings={() => setApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onResetDemo={handleResetDemo}
          apiStatus={apiStatus}
          onOpenApiSettings={() => setApiModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stocks={stocks}
          onSelectStock={handleSelectStock}
          virtualCash={virtualCash}
        />

        {currentSection === 'dashboard' && (
          <Dashboard
            indices={indices}
            portfolio={portfolio}
            stocks={stocks}
            virtualCash={virtualCash}
            onNavigate={handleNavigate}
            onSelectStock={handleSelectStock}
            alerts={alerts}
          />
        )}

        {currentSection === 'markets' && (
          <Markets
            stocks={stocks}
            watchlist={watchlist}
            portfolio={portfolio}
            onSelectStock={handleSelectStock}
            onOpenTradeModal={handleOpenTradeModal}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenAlertModal={handleOpenAlertModal}
            onRefreshQuotes={refreshQuotes}
            isRefreshing={isRefreshing}
          />
        )}

        {currentSection === 'portfolio' && (
          <Portfolio
            portfolio={portfolio}
            stocks={stocks}
            virtualCash={virtualCash}
            onNavigate={handleNavigate}
            onSelectStock={handleSelectStock}
            onOpenTradeModal={handleOpenTradeModal}
          />
        )}

        {currentSection === 'watchlist' && (
          <Watchlist
            watchlist={watchlist}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onRemoveFromWatchlist={handleToggleWatchlist}
            onOpenTradeModal={handleOpenTradeModal}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'alerts' && (
          <PriceAlerts
            alerts={alerts}
            stocks={stocks}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
            onSelectStock={handleSelectStock}
            preselectedSymbol={selectedStock}
          />
        )}

        {currentSection === 'detail' && (
          <StockDetail
            symbol={selectedStock}
            stocks={stocks}
            watchlist={watchlist}
            portfolio={portfolio}
            onBack={() => handleNavigate(previousSection)}
            onOpenTradeModal={handleOpenTradeModal}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenAlertModal={handleOpenAlertModal}
            isDark={theme === 'dark'}
            onUpdateQuote={handleUpdateQuote}
          />
        )}
      </main>

      {/* Buy / Sell Trade Modal */}
      <TradeModal
        isOpen={tradeModal.isOpen}
        onClose={() => setTradeModal(prev => ({ ...prev, isOpen: false }))}
        mode={tradeModal.mode}
        symbol={tradeModal.symbol}
        stocks={stocks}
        portfolio={portfolio}
        virtualCash={virtualCash}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Finnhub API Key Modal */}
      <ApiSettingsModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onApiKeyUpdated={() => {
          refreshQuotes();
          setApiStatus({ isRealData: true, source: 'Finnhub Configured' });
        }}
        onResetDemo={handleResetDemo}
      />

      {/* In-App Toast Notification */}
      <div className={`toast ${toast.show ? '' : 'hidden'}`} id="toast">
        {toast.message}
      </div>
    </div>
  );
}
