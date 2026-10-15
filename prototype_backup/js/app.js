// TradePulse — Main Application Logic

const STORAGE_KEY = 'tradepulse_data';
const THEME_KEY = 'tradepulse_theme';

let state = {
  stocks: JSON.parse(JSON.stringify(STOCKS)),
  indices: JSON.parse(JSON.stringify(INDICES)),
  portfolio: [],
  watchlist: [],
  currentFilter: 'all',
  searchQuery: '',
  tradeModal: { mode: 'buy', symbol: null },
  currentStock: null,
  chartPeriod: '1D',
  previousSection: 'markets'
};

// ─── Utilities ───

function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(value, pct) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
}

function getStock(symbol) {
  return state.stocks.find(s => s.symbol === symbol);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    portfolio: state.portfolio,
    watchlist: state.watchlist
  }));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    state.portfolio = data.portfolio || [...DEFAULT_PORTFOLIO];
    state.watchlist = data.watchlist || [...DEFAULT_WATCHLIST];
  } else {
    state.portfolio = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO));
    state.watchlist = [...DEFAULT_WATCHLIST];
  }
}

function initUser() {
  const session = getSession();
  if (!session) return;
  document.getElementById('userName').textContent = session.name;
  document.getElementById('userClientId').textContent = 'Client ID: ' + session.clientId;
  document.getElementById('userAvatar').textContent = session.name.charAt(0).toUpperCase();
}

// ─── Theme ───

function initTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
  if (state.currentStock) drawChart();
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ─── Navigation ───

function switchSection(sectionId, skipHistory) {
  if (sectionId !== 'stock-detail' && !skipHistory) {
    state.previousSection = sectionId;
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  const navItem = document.querySelector(`[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('sidebar').classList.remove('open');
}

function openStockDetail(symbol) {
  const stock = getStock(symbol);
  if (!stock) return;

  state.currentStock = symbol;
  state.chartPeriod = '1D';
  document.querySelectorAll('#chartTabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.period === '1D');
  });

  renderStockDetail();
  switchSection('stock-detail', true);
}

// ─── Render: Indices ───

function renderIndices() {
  const grid = document.getElementById('indicesGrid');
  grid.innerHTML = state.indices.map(idx => {
    const cls = idx.change >= 0 ? 'positive' : 'negative';
    return `
      <div class="index-card">
        <h3>${idx.name}</h3>
        <p class="index-value">${idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <p class="index-change ${cls}">${formatChange(idx.change, idx.changePct)}</p>
      </div>
    `;
  }).join('');
}

// ─── Render: Portfolio Summary ───

function renderPortfolioSummary() {
  let totalValue = 0;
  let totalInvested = 0;
  let todayPnl = 0;

  state.portfolio.forEach(holding => {
    const stock = getStock(holding.symbol);
    if (!stock) return;
    totalValue += stock.price * holding.qty;
    totalInvested += holding.avgPrice * holding.qty;
    todayPnl += stock.change * holding.qty;
  });

  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const pnlClass = totalPnl >= 0 ? 'positive' : 'negative';

  document.getElementById('portfolioValue').textContent = formatCurrency(totalValue);
  document.getElementById('portfolioChange').className = 'portfolio-change ' + pnlClass;
  document.getElementById('portfolioChange').textContent = formatChange(totalPnl, totalPnlPct);
  document.getElementById('investedAmount').textContent = formatCurrency(totalInvested);
  document.getElementById('todayPnl').textContent = formatCurrency(todayPnl);
  document.getElementById('todayPnl').className = 'stat-value ' + (todayPnl >= 0 ? 'positive' : 'negative');
  document.getElementById('holdingsCount').textContent = state.portfolio.length;
}

// ─── Render: Mini Stock Lists ───

function renderMiniStockList(containerId, stocks) {
  const container = document.getElementById(containerId);
  container.innerHTML = stocks.slice(0, 5).map(stock => {
    const cls = stock.changePct >= 0 ? 'positive' : 'negative';
    return `
      <div class="mini-stock clickable" data-action="view" data-symbol="${stock.symbol}">
        <div>
          <p class="mini-stock-name">${stock.name}</p>
          <p class="mini-stock-symbol">${stock.symbol}</p>
        </div>
        <div>
          <p class="mini-stock-price">${formatCurrency(stock.price)}</p>
          <p class="mini-stock-change ${cls}">${stock.changePct >= 0 ? '+' : ''}${stock.changePct.toFixed(2)}%</p>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Render: Stock Table ───

function getFilteredStocks() {
  let stocks = [...state.stocks];

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    stocks = stocks.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  switch (state.currentFilter) {
    case 'gainers':
      stocks = stocks.filter(s => s.changePct > 0).sort((a, b) => b.changePct - a.changePct);
      break;
    case 'losers':
      stocks = stocks.filter(s => s.changePct < 0).sort((a, b) => a.changePct - b.changePct);
      break;
    case 'nifty50':
      stocks = stocks.filter(s => s.nifty50);
      break;
  }

  return stocks;
}

function renderStockTable() {
  const tbody = document.getElementById('stockTableBody');
  const stocks = getFilteredStocks();

  tbody.innerHTML = stocks.map(stock => {
    const cls = stock.changePct >= 0 ? 'positive' : 'negative';
    const isWatched = state.watchlist.includes(stock.symbol);
    const hasHolding = state.portfolio.some(h => h.symbol === stock.symbol);

    return `
      <tr data-symbol="${stock.symbol}">
        <td class="stock-name-cell clickable" data-action="view" data-symbol="${stock.symbol}">
          <strong>${stock.name}</strong>
          <span>${stock.symbol} · NSE</span>
        </td>
        <td><strong>${formatCurrency(stock.price)}</strong></td>
        <td class="${cls}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}</td>
        <td class="${cls}">${stock.changePct >= 0 ? '+' : ''}${stock.changePct.toFixed(2)}%</td>
        <td>${stock.volume}</td>
        <td>
          <div class="action-btns">
            <button class="btn-star ${isWatched ? 'active' : ''}" data-action="watch" data-symbol="${stock.symbol}" title="Add to watchlist">⭐</button>
            <button class="btn-buy" data-action="buy" data-symbol="${stock.symbol}">Buy</button>
            ${hasHolding ? `<button class="btn-sell" data-action="sell" data-symbol="${stock.symbol}">Sell</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Render: Portfolio Table ───

function renderPortfolio() {
  const empty = document.getElementById('portfolioEmpty');
  const tableCard = document.getElementById('portfolioTableCard');
  const tbody = document.getElementById('portfolioTableBody');

  if (state.portfolio.length === 0) {
    empty.classList.remove('hidden');
    tableCard.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  tableCard.classList.remove('hidden');

  tbody.innerHTML = state.portfolio.map(holding => {
    const stock = getStock(holding.symbol);
    if (!stock) return '';
    const currentVal = stock.price * holding.qty;
    const invested = holding.avgPrice * holding.qty;
    const pnl = currentVal - invested;
    const pnlPct = (pnl / invested) * 100;
    const cls = pnl >= 0 ? 'positive' : 'negative';

    return `
      <tr>
        <td class="stock-name-cell clickable" data-action="view" data-symbol="${stock.symbol}">
          <strong>${stock.name}</strong>
          <span>${stock.symbol}</span>
        </td>
        <td>${holding.qty}</td>
        <td>${formatCurrency(holding.avgPrice)}</td>
        <td>${formatCurrency(stock.price)}</td>
        <td>${formatCurrency(currentVal)}</td>
        <td class="${cls}">${formatChange(pnl, pnlPct)}</td>
        <td>
          <button class="btn-sell" data-action="sell" data-symbol="${stock.symbol}">Sell</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Render: Watchlist ───

function renderWatchlist() {
  const empty = document.getElementById('watchlistEmpty');
  const grid = document.getElementById('watchlistGrid');

  if (state.watchlist.length === 0) {
    empty.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.classList.remove('hidden');

  grid.innerHTML = state.watchlist.map(symbol => {
    const stock = getStock(symbol);
    if (!stock) return '';
    const cls = stock.changePct >= 0 ? 'positive' : 'negative';

    return `
      <div class="watchlist-card">
        <div class="watchlist-card-header">
          <div class="clickable" data-action="view" data-symbol="${symbol}">
            <h3>${stock.name}</h3>
            <p class="symbol">${stock.symbol} · NSE</p>
          </div>
          <button class="btn-star active" data-action="unwatch" data-symbol="${symbol}" title="Remove">⭐</button>
        </div>
        <p class="watchlist-price clickable" data-action="view" data-symbol="${symbol}">${formatCurrency(stock.price)}</p>
        <p class="${cls}">${formatChange(stock.change, stock.changePct)}</p>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn-buy" data-action="buy" data-symbol="${symbol}">Buy</button>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Render: Stock Detail ───

function renderStockDetail() {
  const stock = getStock(state.currentStock);
  if (!stock) return;

  const cls = stock.changePct >= 0 ? 'positive' : 'negative';
  const meta = STOCK_META[stock.symbol] || {};
  const isWatched = state.watchlist.includes(stock.symbol);
  const hasHolding = state.portfolio.some(h => h.symbol === stock.symbol);

  document.getElementById('detailStockName').textContent = stock.name;
  document.getElementById('detailStockSymbol').textContent = `${stock.symbol} · NSE · ${meta.sector || 'Equity'}`;
  document.getElementById('detailPrice').textContent = formatCurrency(stock.price);
  document.getElementById('detailChange').className = 'detail-change ' + cls;
  document.getElementById('detailChange').textContent = formatChange(stock.change, stock.changePct);

  document.getElementById('detailStats').innerHTML = `
    <div class="stat-item"><span class="stat-label">Market Cap</span><span class="stat-value">${meta.marketCap || '—'}</span></div>
    <div class="stat-item"><span class="stat-label">P/E Ratio</span><span class="stat-value">${meta.pe || '—'}</span></div>
    <div class="stat-item"><span class="stat-label">52W High</span><span class="stat-value">${meta.high52 ? formatCurrency(meta.high52) : '—'}</span></div>
    <div class="stat-item"><span class="stat-label">52W Low</span><span class="stat-value">${meta.low52 ? formatCurrency(meta.low52) : '—'}</span></div>
    <div class="stat-item"><span class="stat-label">Volume</span><span class="stat-value">${stock.volume}</span></div>
    <div class="stat-item"><span class="stat-label">Nifty 50</span><span class="stat-value">${stock.nifty50 ? 'Yes' : 'No'}</span></div>
  `;

  document.getElementById('detailWatchBtn').textContent = isWatched ? '⭐ Remove from Watchlist' : '⭐ Add to Watchlist';
  document.getElementById('detailSellBtn').classList.toggle('hidden', !hasHolding);

  drawChart();
}

function drawChart() {
  const canvas = document.getElementById('stockChart');
  if (!canvas || !state.currentStock) return;

  const stock = getStock(state.currentStock);
  const { prices } = getChartData(state.currentStock, state.chartPeriod, stock.price);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width - 48;
  const height = 320;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? '#2d3748' : '#e8ecf1';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const lineColor = stock.changePct >= 0 ? '#10b981' : '#ef4444';
  const fillColor = stock.changePct >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...prices) * 0.998;
  const max = Math.max(...prices) * 1.002;
  const range = max - min || 1;

  ctx.clearRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const val = max - (range / 4) * i;
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('₹' + val.toFixed(0), padding.left - 8, y + 4);
  }

  // Area fill
  ctx.beginPath();
  prices.forEach((price, i) => {
    const x = padding.left + (chartW / (prices.length - 1)) * i;
    const y = padding.top + chartH - ((price - min) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  const lastX = padding.left + chartW;
  ctx.lineTo(lastX, padding.top + chartH);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Line
  ctx.beginPath();
  prices.forEach((price, i) => {
    const x = padding.left + (chartW / (prices.length - 1)) * i;
    const y = padding.top + chartH - ((price - min) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // End dot
  const endX = padding.left + chartW;
  const endY = padding.top + chartH - ((prices[prices.length - 1] - min) / range) * chartH;
  ctx.beginPath();
  ctx.arc(endX, endY, 5, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
}

// ─── Render All ───

function renderAll() {
  renderIndices();
  renderPortfolioSummary();

  const sorted = [...state.stocks].sort((a, b) => b.changePct - a.changePct);
  renderMiniStockList('topGainers', sorted.filter(s => s.changePct > 0));
  renderMiniStockList('topLosers', sorted.filter(s => s.changePct < 0).reverse());

  renderStockTable();
  renderPortfolio();
  renderWatchlist();

  if (state.currentStock && document.getElementById('stock-detail').classList.contains('active')) {
    renderStockDetail();
  }
}

// ─── Trade Modal ───

function openTradeModal(mode, symbol) {
  const stock = getStock(symbol);
  if (!stock) return;

  state.tradeModal = { mode, symbol };

  document.getElementById('modalTitle').textContent = mode === 'buy' ? 'Buy Stock' : 'Sell Stock';
  document.getElementById('modalStockName').textContent = `${stock.name} (${stock.symbol})`;
  document.getElementById('modalStockPrice').textContent = formatCurrency(stock.price);
  document.getElementById('tradeQty').value = 1;

  const confirmBtn = document.getElementById('modalConfirm');
  confirmBtn.textContent = mode === 'buy' ? 'Confirm Buy' : 'Confirm Sell';
  confirmBtn.classList.toggle('sell-mode', mode === 'sell');

  if (mode === 'sell') {
    const holding = state.portfolio.find(h => h.symbol === symbol);
    document.getElementById('tradeQty').max = holding ? holding.qty : 1;
  } else {
    document.getElementById('tradeQty').removeAttribute('max');
  }

  updateTradeTotal();
  document.getElementById('tradeModal').classList.remove('hidden');
}

function closeTradeModal() {
  document.getElementById('tradeModal').classList.add('hidden');
  state.tradeModal = { mode: 'buy', symbol: null };
}

function updateTradeTotal() {
  const stock = getStock(state.tradeModal.symbol);
  const qty = parseInt(document.getElementById('tradeQty').value) || 0;
  if (stock) {
    document.getElementById('tradeTotal').textContent = formatCurrency(stock.price * qty);
  }
}

function executeTrade() {
  const { mode, symbol } = state.tradeModal;
  const stock = getStock(symbol);
  const qty = parseInt(document.getElementById('tradeQty').value);

  if (!stock || !qty || qty < 1) {
    showToast('Please enter a valid quantity');
    return;
  }

  if (mode === 'buy') {
    const existing = state.portfolio.find(h => h.symbol === symbol);
    if (existing) {
      const totalQty = existing.qty + qty;
      existing.avgPrice = ((existing.avgPrice * existing.qty) + (stock.price * qty)) / totalQty;
      existing.qty = totalQty;
    } else {
      state.portfolio.push({ symbol, qty, avgPrice: stock.price });
    }
    showToast(`Bought ${qty} shares of ${symbol} at ${formatCurrency(stock.price)}`);
  } else {
    const holding = state.portfolio.find(h => h.symbol === symbol);
    if (!holding || holding.qty < qty) {
      showToast('Insufficient holdings to sell');
      return;
    }
    holding.qty -= qty;
    if (holding.qty === 0) {
      state.portfolio = state.portfolio.filter(h => h.symbol !== symbol);
    }
    showToast(`Sold ${qty} shares of ${symbol} at ${formatCurrency(stock.price)}`);
  }

  saveState();
  closeTradeModal();
  renderAll();
}

// ─── Watchlist Toggle ───

function toggleWatchlist(symbol) {
  const idx = state.watchlist.indexOf(symbol);
  if (idx >= 0) {
    state.watchlist.splice(idx, 1);
    showToast(`Removed ${symbol} from watchlist`);
  } else {
    state.watchlist.push(symbol);
    showToast(`Added ${symbol} to watchlist`);
  }
  saveState();
  renderAll();
}

// ─── Live Price Simulation ───

function simulatePriceUpdates() {
  state.stocks.forEach(stock => {
    const fluctuation = (Math.random() - 0.5) * stock.price * 0.002;
    stock.price = Math.max(1, stock.price + fluctuation);
    stock.change += fluctuation;
    stock.changePct = (stock.change / (stock.price - stock.change)) * 100;
  });

  state.indices.forEach(idx => {
    const fluctuation = (Math.random() - 0.5) * idx.value * 0.0005;
    idx.value += fluctuation;
    idx.change += fluctuation;
    idx.changePct = (idx.change / (idx.value - idx.change)) * 100;
  });

  renderAll();
}

// ─── Event Listeners ───

function initEventListeners() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(el.dataset.goto);
    });
  });

  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.getElementById('logoutBtn').addEventListener('click', logout);

  document.getElementById('backFromDetail').addEventListener('click', () => {
    switchSection(state.previousSection);
  });

  document.getElementById('globalSearch').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery) switchSection('markets');
    renderStockTable();
  });

  document.querySelectorAll('#marketTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#marketTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentFilter = tab.dataset.filter;
      renderStockTable();
    });
  });

  document.querySelectorAll('#chartTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#chartTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.chartPeriod = tab.dataset.period;
      drawChart();
    });
  });

  document.getElementById('detailBuyBtn').addEventListener('click', () => {
    if (state.currentStock) openTradeModal('buy', state.currentStock);
  });

  document.getElementById('detailSellBtn').addEventListener('click', () => {
    if (state.currentStock) openTradeModal('sell', state.currentStock);
  });

  document.getElementById('detailWatchBtn').addEventListener('click', () => {
    if (state.currentStock) toggleWatchlist(state.currentStock);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { action, symbol } = btn.dataset;
    switch (action) {
      case 'view':
        openStockDetail(symbol);
        break;
      case 'buy':
        openTradeModal('buy', symbol);
        break;
      case 'sell':
        openTradeModal('sell', symbol);
        break;
      case 'watch':
        toggleWatchlist(symbol);
        break;
      case 'unwatch':
        toggleWatchlist(symbol);
        break;
    }
  });

  document.getElementById('modalClose').addEventListener('click', closeTradeModal);
  document.getElementById('modalCancel').addEventListener('click', closeTradeModal);
  document.getElementById('modalConfirm').addEventListener('click', executeTrade);
  document.getElementById('tradeQty').addEventListener('input', updateTradeTotal);

  document.getElementById('tradeModal').addEventListener('click', (e) => {
    if (e.target.id === 'tradeModal') closeTradeModal();
  });

  document.querySelectorAll('.order-type').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-type').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('resetDemo').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state.portfolio = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO));
    state.watchlist = [...DEFAULT_WATCHLIST];
    state.stocks = JSON.parse(JSON.stringify(STOCKS));
    state.indices = JSON.parse(JSON.stringify(INDICES));
    state.searchQuery = '';
    document.getElementById('globalSearch').value = '';
    renderAll();
    showToast('Demo data reset successfully');
  });

  window.addEventListener('resize', () => {
    if (state.currentStock) drawChart();
  });
}

// ─── Init ───

function init() {
  initTheme();
  initUser();
  loadState();
  initEventListeners();
  renderAll();
  setInterval(simulatePriceUpdates, 3000);
}

document.addEventListener('DOMContentLoaded', init);