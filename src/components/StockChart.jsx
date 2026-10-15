import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchHistoricalCandles, getStockCurrency } from '../services/stockApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StockChart({ symbol, currentPrice, isPositive, isDark }) {
  const [period, setPeriod] = useState('1M');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('');
  const chartRef = useRef(null);

  const currency = getStockCurrency(symbol);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchHistoricalCandles(symbol, period, currentPrice || 150).then(data => {
      if (!isMounted) return;
      setChartData(data);
      setDataSource(data.source || 'Market Data');
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [symbol, period, currentPrice]);

  const prices = chartData?.prices || [];
  const labels = chartData?.labels || [];

  // Determine actual trend color over this specific period
  const periodIsPositive = prices.length >= 2 ? prices[prices.length - 1] >= prices[0] : isPositive;
  const lineColor = periodIsPositive ? '#10b981' : '#ef4444';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  const data = {
    labels,
    datasets: [
      {
        label: `${symbol} Price`,
        data: prices,
        borderColor: lineColor,
        borderWidth: 2.2,
        tension: 0.18,
        pointRadius: (ctx) => {
          const index = ctx.dataIndex;
          const count = ctx.dataset.data.length;
          return index === count - 1 ? 4 : 0; // Highlight the latest current price point
        },
        pointHoverRadius: 5,
        pointBackgroundColor: lineColor,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          if (periodIsPositive) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          }
          return gradient;
        },
        fill: true
      }
    ]
  };

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;
  const padding = (maxPrice - minPrice) * 0.08 || 1;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1a1a2e',
        bodyColor: isDark ? '#e2e8f0' : '#1a1a2e',
        borderColor: isDark ? '#2d3748' : '#e8ecf1',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            const locale = currency === '₹' ? 'en-IN' : 'en-US';
            return ` Price: ${currency}${val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 11 },
          maxTicksLimit: period === '1D' ? 8 : period === '1W' ? 5 : 7,
          maxRotation: 0
        }
      },
      y: {
        position: 'right',
        min: Math.max(0, Math.floor(minPrice - padding)),
        max: Math.ceil(maxPrice + padding),
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 11 },
          callback: (value) => {
            const locale = currency === '₹' ? 'en-IN' : 'en-US';
            return `${currency}${Number(value).toLocaleString(locale, { maximumFractionDigits: 0 })}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="card chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div className="chart-tabs" id="chartTabs">
          {['1D', '1W', '1M', '1Y'].map(p => (
            <button
              key={p}
              className={`tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {dataSource}
        </span>
      </div>

      <div className="chart-wrapper">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Rendering market analytics...</span>
          </div>
        ) : (
          <Line ref={chartRef} data={data} options={options} />
        )}
      </div>
    </div>
  );
}
