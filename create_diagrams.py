import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Set font family
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Color palette
    bg_client = '#E8F5E9'
    border_client = '#2E7D32'
    bg_server = '#E3F2FD'
    border_server = '#1565C0'
    bg_cloud = '#FFF3E0'
    border_cloud = '#E65100'

    # Title
    ax.text(5, 6.6, 'TradePulse High-Level 3-Tier System Architecture', ha='center', va='center', fontsize=14, fontweight='bold', color='#1E293B')

    # 1. Client Tier Box
    rect1 = patches.FancyBboxPatch((0.5, 0.8), 2.8, 5.2, boxstyle="round,pad=0.2", facecolor=bg_client, edgecolor=border_client, linewidth=2)
    ax.add_patch(rect1)
    ax.text(1.9, 5.7, 'CLIENT TIER (BROWSER)', ha='center', va='center', fontsize=10, fontweight='bold', color=border_client)
    
    components_client = [
        ('React 18 & Vite SPA', 4.9),
        ('Chart.js Technical Charts', 4.1),
        ('Virtual Trading Engine\n($50,000 Portfolio)', 3.2),
        ('Autonomous Market Engine\n(Geometric Brownian Motion)', 2.2),
        ('HTML5 LocalStorage\n(Session, Portfolio, Alerts)', 1.2)
    ]
    for name, y in components_client:
        r = patches.FancyBboxPatch((0.7, y-0.3), 2.4, 0.6, boxstyle="round,pad=0.1", facecolor='white', edgecolor='#81C784', linewidth=1)
        ax.add_patch(r)
        ax.text(1.9, y, name, ha='center', va='center', fontsize=8, color='#1B5E20')

    # 2. Server Gateway Tier Box
    rect2 = patches.FancyBboxPatch((3.7, 1.5), 2.6, 4.5, boxstyle="round,pad=0.2", facecolor=bg_server, edgecolor=border_server, linewidth=2)
    ax.add_patch(rect2)
    ax.text(5.0, 5.7, 'API GATEWAY (NODE / EXPRESS)', ha='center', va='center', fontsize=10, fontweight='bold', color=border_server)

    components_server = [
        ('Express.js REST Server\n(Port 5001 / Cloud)', 4.7),
        ('CORS Security Layer\n(Origin Whitelisting)', 3.8),
        ('Parameter Validation\n(/api/stocks/quote, candles)', 2.9),
        ('Health & Zero-Secret Relay\n(/api/health)', 2.0)
    ]
    for name, y in components_server:
        r = patches.FancyBboxPatch((3.9, y-0.3), 2.2, 0.6, boxstyle="round,pad=0.1", facecolor='white', edgecolor='#64B5F6', linewidth=1)
        ax.add_patch(r)
        ax.text(5.0, y, name, ha='center', va='center', fontsize=8, color='#0D47A1')

    # 3. External & Cloud Tier Box
    rect3 = patches.FancyBboxPatch((6.7, 1.5), 2.8, 4.5, boxstyle="round,pad=0.2", facecolor=bg_cloud, edgecolor=border_cloud, linewidth=2)
    ax.add_patch(rect3)
    ax.text(8.1, 5.7, 'CLOUD & DATA PROVIDERS', ha='center', va='center', fontsize=10, fontweight='bold', color=border_cloud)

    components_cloud = [
        ('Finnhub Stock API\n(Real-Time Global Feeds)', 4.7),
        ('Render Cloud Platform\n(Free Web Service Hosting)', 3.8),
        ('GitHub Pages Global CDN\n(Static Frontend Distribution)', 2.9),
        ('GitHub Version Control\n(CI/CD Deployment Pipeline)', 2.0)
    ]
    for name, y in components_cloud:
        r = patches.FancyBboxPatch((6.9, y-0.3), 2.4, 0.6, boxstyle="round,pad=0.1", facecolor='white', edgecolor='#FFB74D', linewidth=1)
        ax.add_patch(r)
        ax.text(8.1, y, name, ha='center', va='center', fontsize=8, color='#E65100')

    # Arrows
    arrow_props = dict(arrowstyle="<->", color="#334155", lw=2, mutation_scale=15)
    ax.annotate('', xy=(3.7, 4.0), xytext=(3.3, 4.0), arrowprops=arrow_props)
    ax.text(3.5, 4.25, 'JSON / HTTP', ha='center', va='center', fontsize=7, color='#475569', fontweight='bold')

    ax.annotate('', xy=(6.7, 4.0), xytext=(6.3, 4.0), arrowprops=arrow_props)
    ax.text(6.5, 4.25, 'REST API', ha='center', va='center', fontsize=7, color='#475569', fontweight='bold')

    # Standby fallback curved arrow
    ax.annotate('Autonomous Fallback Engine\n(100% Zero-Downtime Guarantee)', xy=(1.9, 0.7), xytext=(5.0, 0.5),
                ha='center', va='center', fontsize=8, fontweight='bold', color='#2E7D32',
                bbox=dict(boxstyle="round,pad=0.3", fc="#DCFCE7", ec="#86EFAC", lw=1))

    plt.tight_layout()
    plt.savefig('report_assets/fig_architecture.png', dpi=300)
    plt.close()
    print('Created report_assets/fig_architecture.png')

def create_gbm_flowchart():
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(5, 7.6, 'Geometric Brownian Motion Candlestick Generation Flowchart', ha='center', va='center', fontsize=13, fontweight='bold', color='#1E293B')

    boxes = [
        ('Start: Request Historical Candles (Symbol, Period)', 5, 6.8, '#E2E8F0', '#475569'),
        ('Determine Timeframe & Resolution (1D, 1W, 1M, 1Y)', 5, 5.8, '#DBEAFE', '#2563EB'),
        ('Fetch Baseline Asset Parameters (Price P0, Volatility σ, Drift μ)', 5, 4.8, '#DBEAFE', '#2563EB'),
        ('Calculate Daily Log Returns:\nΔS = S * (μ * Δt + σ * ε * √Δt), where ε ~ N(0, 1)', 5, 3.7, '#FEF3C7', '#D97706'),
        ('Derive Candlestick OHLC:\nOpen, High = max(O,C)+spread, Low = min(O,C)-spread, Close', 5, 2.5, '#FEF3C7', '#D97706'),
        ('Inject Realistic Trading Volume with Poisson/Log-Normal Distribution', 5, 1.4, '#DCFCE7', '#16A34A'),
        ('Return Candlestick Dataset to Chart.js for Rendering', 5, 0.5, '#DCFCE7', '#16A34A')
    ]

    for text, x, y, fc, ec in boxes:
        r = patches.FancyBboxPatch((x-3.2, y-0.35), 6.4, 0.7, boxstyle="round,pad=0.15", facecolor=fc, edgecolor=ec, linewidth=1.5)
        ax.add_patch(r)
        ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0F172A')

    # Arrows
    for i in range(len(boxes)-1):
        y1 = boxes[i][2] - 0.35
        y2 = boxes[i+1][2] + 0.35
        ax.annotate('', xy=(5, y2), xytext=(5, y1), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5, mutation_scale=12))

    plt.tight_layout()
    plt.savefig('report_assets/fig_gbm_flowchart.png', dpi=300)
    plt.close()
    print('Created report_assets/fig_gbm_flowchart.png')

def create_portfolio_flowchart():
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(5, 7.6, 'Virtual Portfolio Order Execution and Accounting Flowchart', ha='center', va='center', fontsize=13, fontweight='bold', color='#1E293B')

    # Left path: Buy Order, Right path: Sell Order
    r_start = patches.FancyBboxPatch((2.5, 6.5), 5.0, 0.6, boxstyle="round,pad=0.1", facecolor='#F1F5F9', edgecolor='#64748B', linewidth=1.5)
    ax.add_patch(r_start)
    ax.text(5, 6.8, 'Trade Order Submitted: Symbol, Quantity, Current Price', ha='center', va='center', fontsize=9, fontweight='bold')

    # Decision diamond
    diamond = patches.Polygon([[5, 6.1], [6.8, 5.4], [5, 4.7], [3.2, 5.4]], facecolor='#FEF9C3', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(diamond)
    ax.text(5, 5.4, 'Order Mode?\n(BUY or SELL)', ha='center', va='center', fontsize=8.5, fontweight='bold')

    # Buy path (Left)
    r_b1 = patches.FancyBboxPatch((0.5, 3.8), 3.8, 0.6, boxstyle="round,pad=0.1", facecolor='#E0F2FE', edgecolor='#0284C7', linewidth=1.5)
    ax.add_patch(r_b1)
    ax.text(2.4, 4.1, 'Check Cash: Balance >= Total Cost?', ha='center', va='center', fontsize=8)

    r_b2 = patches.FancyBboxPatch((0.5, 2.6), 3.8, 0.6, boxstyle="round,pad=0.1", facecolor='#E0F2FE', edgecolor='#0284C7', linewidth=1.5)
    ax.add_patch(r_b2)
    ax.text(2.4, 2.9, 'Deduct Cash & Update Weighted Avg Price:\nNewAvg = (ExistingVal + Cost) / TotalQty', ha='center', va='center', fontsize=7.5)

    # Sell path (Right)
    r_s1 = patches.FancyBboxPatch((5.7, 3.8), 3.8, 0.6, boxstyle="round,pad=0.1", facecolor='#FEE2E2', edgecolor='#DC2626', linewidth=1.5)
    ax.add_patch(r_s1)
    ax.text(7.6, 4.1, 'Check Position: Held Qty >= Sell Qty?', ha='center', va='center', fontsize=8)

    r_s2 = patches.FancyBboxPatch((5.7, 2.6), 3.8, 0.6, boxstyle="round,pad=0.1", facecolor='#FEE2E2', edgecolor='#DC2626', linewidth=1.5)
    ax.add_patch(r_s2)
    ax.text(7.6, 2.9, 'Credit Proceeds & Reduce Position:\nRemove holding if remaining Qty == 0', ha='center', va='center', fontsize=7.5)

    # Common end
    r_end = patches.FancyBboxPatch((2.2, 1.0), 5.6, 0.7, boxstyle="round,pad=0.1", facecolor='#DCFCE7', edgecolor='#16A34A', linewidth=1.5)
    ax.add_patch(r_end)
    ax.text(5, 1.35, 'Recalculate Total Invested, Portfolio Value & P&L\nPersist to HTML5 LocalStorage & Trigger Toast', ha='center', va='center', fontsize=8.5, fontweight='bold', color='#15803D')

    # Arrows
    arr = dict(arrowstyle="->", color="#334155", lw=1.5, mutation_scale=12)
    ax.annotate('', xy=(5, 6.1), xytext=(5, 6.5), arrowprops=arr)
    ax.annotate('BUY', xy=(2.4, 4.4), xytext=(3.5, 5.4), arrowprops=arr)
    ax.annotate('SELL', xy=(7.6, 4.4), xytext=(6.5, 5.4), arrowprops=arr)
    ax.annotate('', xy=(2.4, 3.2), xytext=(2.4, 3.8), arrowprops=arr)
    ax.annotate('', xy=(7.6, 3.2), xytext=(7.6, 3.8), arrowprops=arr)
    ax.annotate('', xy=(4.0, 1.7), xytext=(2.4, 2.6), arrowprops=arr)
    ax.annotate('', xy=(6.0, 1.7), xytext=(7.6, 2.6), arrowprops=arr)

    plt.tight_layout()
    plt.savefig('report_assets/fig_portfolio_flowchart.png', dpi=300)
    plt.close()
    print('Created report_assets/fig_portfolio_flowchart.png')

def create_alert_engine_diagram():
    fig, ax = plt.subplots(figsize=(9, 4.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(5, 5.6, 'Real-Time Price Alert Engine State Machine', ha='center', va='center', fontsize=13, fontweight='bold', color='#1E293B')

    states = [
        ('Active Monitoring', 1.8, 3.5, '#E0F2FE', '#0284C7', 'Alert created: Target Price $T,\nCondition: ABOVE or BELOW'),
        ('Price Evaluation', 5.0, 3.5, '#FEF9C3', '#CA8A04', 'Compare incoming price P:\n(P >= T for ABOVE) or (P <= T for BELOW)'),
        ('Triggered & Dispatched', 8.2, 3.5, '#DCFCE7', '#16A34A', 'Mark triggered = true,\nEmit In-App Toast,\nPersist triggeredAt timestamp')
    ]

    for title, x, y, fc, ec, desc in states:
        r = patches.FancyBboxPatch((x-1.4, y-0.9), 2.8, 1.8, boxstyle="round,pad=0.15", facecolor=fc, edgecolor=ec, linewidth=2)
        ax.add_patch(r)
        ax.text(x, y+0.4, title, ha='center', va='center', fontsize=9.5, fontweight='bold')
        ax.text(x, y-0.2, desc, ha='center', va='center', fontsize=7.5, color='#334155')

    arr = dict(arrowstyle="->", color="#334155", lw=2, mutation_scale=15)
    ax.annotate('Price Update', xy=(3.6, 3.7), xytext=(3.2, 3.7), arrowprops=arr)
    ax.annotate('Condition Met', xy=(6.8, 3.7), xytext=(6.4, 3.7), arrowprops=arr)

    # Prevent duplicate notification loop back
    r_dup = patches.FancyBboxPatch((3.5, 0.4), 3.0, 0.7, boxstyle="round,pad=0.1", facecolor='#F1F5F9', edgecolor='#94A3B8', linewidth=1)
    ax.add_patch(r_dup)
    ax.text(5.0, 0.75, 'Duplicate Prevention Filter:\nIgnore alert if triggered === true', ha='center', va='center', fontsize=8, color='#475569')

    ax.annotate('', xy=(5.0, 1.1), xytext=(8.2, 2.6), arrowprops=dict(arrowstyle="->", color="#64748B", lw=1.5, connectionstyle="arc3,rad=0.3"))

    plt.tight_layout()
    plt.savefig('report_assets/fig_alert_engine.png', dpi=300)
    plt.close()
    print('Created report_assets/fig_alert_engine.png')

if __name__ == '__main__':
    create_architecture_diagram()
    create_gbm_flowchart()
    create_portfolio_flowchart()
    create_alert_engine_diagram()
