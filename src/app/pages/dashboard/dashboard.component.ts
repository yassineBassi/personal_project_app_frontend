import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { AnalyticsService, Dashboard } from '../../core/services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="dashboard-page">
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <div class="page-header" @fadeIn>
        <div>
          <h1 class="page-title">Analytics <span class="gradient-text">Dashboard</span></h1>
          <p class="page-subtitle">Real-time insights for your shortened URLs</p>
        </div>
        <button class="refresh-btn" (click)="loadDashboard()" [class.spinning]="loading()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="refresh-icon">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      @if (loading() && !dashboard()) {
        <div class="loading-state" @fadeIn>
          <div class="loading-spinner-large"></div>
          <p>Loading analytics...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state" @fadeIn>
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="10.29 3.86 1.82 18 2 18 22 18 22.18 18 13.71 3.86 10.29 3.86"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadDashboard()">Retry</button>
        </div>
      }

      @if (dashboard(); as data) {
        <!-- Summary Stats -->
        <div class="stats-grid" @fadeIn>
          <div class="stat-card">
            <div class="stat-icon-wrap" style="--c: rgba(167,139,250,0.12); --s: #a78bfa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <div class="stat-value">{{ data.summary.totalUrls | number }}</div>
            <div class="stat-label">Total URLs</div>
            <div class="stat-bar" style="--p: 100%; --c: #a78bfa"></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="--c: rgba(96,165,250,0.12); --s: #60a5fa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>
              </svg>
            </div>
            <div class="stat-value">{{ data.summary.totalClicks | number }}</div>
            <div class="stat-label">Total Clicks</div>
            <div class="stat-bar" style="--p: 80%; --c: #60a5fa"></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="--c: rgba(52,211,153,0.12); --s: #34d399">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-value">{{ data.summary.uniqueVisitors | number }}</div>
            <div class="stat-label">Unique Visitors</div>
            <div class="stat-bar" style="--p: 65%; --c: #34d399"></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="--c: rgba(244,114,182,0.12); --s: #f472b6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div class="stat-value">{{ data.summary.avgClicksPerUrl | number:'1.1-1' }}</div>
            <div class="stat-label">Avg Clicks / URL</div>
            <div class="stat-bar" style="--p: 50%; --c: #f472b6"></div>
          </div>
        </div>

        <!-- Activity Banner -->
        <div class="activity-banner" @fadeIn>
          <div class="activity-left">
            <span class="activity-eyebrow">Last 24 Hours</span>
            <div class="activity-number">{{ data.activity.clicksLast24h | number }}</div>
            <span class="activity-vs">vs {{ data.activity.clicksPrev24h | number }} previous 24h</span>
          </div>
          <div class="activity-right">
            <div class="growth-chip"
              [class.positive]="data.activity.growthRate >= 0"
              [class.negative]="data.activity.growthRate < 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                @if (data.activity.growthRate >= 0) {
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                } @else {
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                }
              </svg>
              {{ data.activity.growthRate | number:'1.1-1' }}%
            </div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-row" @fadeIn>
          <div class="chart-card wide">
            <div class="chart-header">
              <span class="chart-title">30-Day Click Trend</span>
            </div>
            <div class="chart-wrapper">
              <canvas #trendChart></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Browser Breakdown</span>
            </div>
            <div class="chart-wrapper">
              <canvas #browserChart></canvas>
            </div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Device Types</span>
            </div>
            <div class="chart-wrapper">
              <canvas #deviceChart></canvas>
            </div>
          </div>
          <div class="chart-card wide">
            <div class="chart-header">
              <span class="chart-title">Operating Systems</span>
            </div>
            <div class="chart-wrapper">
              <canvas #osChart></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Peak Hours</span>
            </div>
            <div class="chart-wrapper">
              <canvas #hoursChart></canvas>
            </div>
          </div>

          <div class="top-urls-card">
            <div class="chart-header">
              <span class="chart-title">Top URLs</span>
            </div>
            <div class="top-urls-list">
              @for (url of data.topUrls; track url.code; let i = $index) {
                <a class="top-url-item" [routerLink]="['/url', url.code]">
                  <div class="url-rank">{{ i + 1 }}</div>
                  <div class="url-info">
                    <div class="url-code">{{ url.code }}</div>
                    <div class="url-original">{{ url.originalUrl | slice:0:42 }}{{ url.originalUrl.length > 42 ? '…' : '' }}</div>
                  </div>
                  <div class="url-clicks">
                    <span class="clicks-num">{{ url.clickCount | number }}</span>
                    <span class="clicks-label">clicks</span>
                  </div>
                </a>
              }
              @if (data.topUrls.length === 0) {
                <div class="empty-msg">No URLs tracked yet</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      padding: 5.5rem 1.75rem 3.5rem;
      max-width: 1240px;
      margin: 0 auto;
      position: relative;
    }

    .bg-orbs {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(110px);
    }

    .orb-1 {
      width: 650px; height: 650px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.1), transparent 70%);
      top: -220px; right: -220px;
    }

    .orb-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(29, 78, 216, 0.08), transparent 70%);
      bottom: -120px; left: -120px;
    }

    /* ── Header ── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2.25rem;
      position: relative;
      z-index: 1;
    }

    .page-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 0.2rem 0;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .gradient-text {
      background: linear-gradient(130deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      color: rgba(255,255,255,0.38);
      font-size: 0.88rem;
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 9px;
      color: rgba(255,255,255,0.55);
      font-size: 0.84rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      margin-top: 0.35rem;
    }

    .refresh-icon {
      width: 14px; height: 14px;
      transition: transform 0.3s ease;
    }

    .refresh-btn:hover {
      background: rgba(255,255,255,0.07);
      color: #fff;
      border-color: rgba(255,255,255,0.12);
    }

    .refresh-btn.spinning .refresh-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Loading / Error ── */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 300px;
      color: rgba(255,255,255,0.45);
      position: relative;
      z-index: 1;
    }

    .loading-spinner-large {
      width: 40px; height: 40px;
      border: 3px solid rgba(167, 139, 250, 0.18);
      border-top-color: #a78bfa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .error-icon {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: rgba(248, 113, 113, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-icon svg {
      width: 24px; height: 24px;
      color: #f87171;
    }

    .retry-btn {
      padding: 0.5rem 1.5rem;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.25);
      border-radius: 9px;
      color: #a78bfa;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background: rgba(167, 139, 250, 0.18);
    }

    /* ── Stat Cards ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .stat-card {
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 20px;
      padding: 1.6rem 1.5rem 1.4rem;
      transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card:hover {
      background: rgba(255,255,255,0.042);
      border-color: rgba(255,255,255,0.1);
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
    }

    .stat-icon-wrap {
      width: 42px; height: 42px;
      border-radius: 12px;
      background: var(--c);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.1rem;
    }

    .stat-icon-wrap svg {
      width: 20px; height: 20px;
      color: var(--s);
    }

    .stat-value {
      font-size: 2.1rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.035em;
      margin-bottom: 0.2rem;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.775rem;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      letter-spacing: 0.01em;
      margin-bottom: 1.2rem;
    }

    .stat-bar {
      position: absolute;
      bottom: 0; left: 0;
      height: 2.5px;
      width: var(--p);
      background: linear-gradient(to right, var(--c), var(--c));
      background: var(--c);
      border-radius: 0 2px 0 0;
      opacity: 0.8;
    }

    /* ── Activity Banner ── */
    .activity-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 20px;
      padding: 1.5rem 2rem;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .activity-left {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .activity-eyebrow {
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.38);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      align-self: center;
    }

    .activity-number {
      font-size: 2.6rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .activity-vs {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.32);
      align-self: center;
    }

    .growth-chip {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 1rem;
      border-radius: 100px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .growth-chip svg {
      width: 14px; height: 14px;
    }

    .growth-chip.positive {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.2);
    }

    .growth-chip.negative {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
    }

    /* ── Chart Cards ── */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .chart-card {
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 20px;
      padding: 1.5rem;
    }

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .chart-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .chart-wrapper {
      position: relative;
      height: 220px;
    }

    /* ── Top URLs ── */
    .top-urls-card {
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 20px;
      padding: 1.5rem;
    }

    .top-urls-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .top-url-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.85rem;
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      text-decoration: none;
      transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
      cursor: pointer;
    }

    .top-url-item:hover {
      background: rgba(167, 139, 250, 0.07);
      border-color: rgba(167, 139, 250, 0.18);
      transform: translateX(2px);
    }

    .url-rank {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.35);
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .url-info { flex: 1; min-width: 0; }

    .url-code {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.82rem;
      color: #a78bfa;
      font-weight: 600;
      margin-bottom: 0.08rem;
    }

    .url-original {
      font-size: 0.73rem;
      color: rgba(255,255,255,0.28);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .url-clicks {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .clicks-num {
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
    }

    .clicks-label {
      font-size: 0.68rem;
      color: rgba(255,255,255,0.28);
      font-weight: 400;
    }

    .empty-msg {
      text-align: center;
      color: rgba(255,255,255,0.28);
      padding: 2.5rem;
      font-size: 0.875rem;
    }

    @media (max-width: 960px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .bottom-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 520px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .activity-banner { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .dashboard-page { padding-left: 1rem; padding-right: 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('browserChart') browserChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deviceChart') deviceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('osChart') osChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hoursChart') hoursChartRef!: ElementRef<HTMLCanvasElement>;

  loading = signal(false);
  error = signal('');
  dashboard = signal<Dashboard | null>(null);

  private charts: Chart[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  ngAfterViewInit() {}

  loadDashboard() {
    this.loading.set(true);
    this.error.set('');
    this.destroyCharts();

    this.analyticsService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(data), 100);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard. Make sure the backend is running.');
        this.loading.set(false);
      }
    });
  }

  private renderCharts(data: Dashboard) {
    this.destroyCharts();
    this.renderTrendChart(data);
    this.renderBrowserChart(data);
    this.renderDeviceChart(data);
    this.renderOsChart(data);
    this.renderHoursChart(data);
  }

  private renderTrendChart(data: Dashboard) {
    if (!this.trendChartRef?.nativeElement) return;
    const ctx = this.trendChartRef.nativeElement.getContext('2d')!;
    const labels = data.trend.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Clicks',
          data: data.trend.map(d => d.clicks),
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#a78bfa',
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxTicksLimit: 8 }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
            beginAtZero: true
          }
        }
      }
    }));
  }

  private renderBrowserChart(data: Dashboard) {
    if (!this.browserChartRef?.nativeElement) return;
    const ctx = this.browserChartRef.nativeElement.getContext('2d')!;
    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c', '#facc15'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.browsers.map(b => b.browser || 'Unknown'),
        datasets: [{
          data: data.browsers.map(b => b.count),
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, padding: 10 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private renderDeviceChart(data: Dashboard) {
    if (!this.deviceChartRef?.nativeElement) return;
    const ctx = this.deviceChartRef.nativeElement.getContext('2d')!;
    const colors = ['#34d399', '#60a5fa', '#f472b6', '#fb923c', '#facc15', '#a78bfa'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.deviceTypes.map(d => d.deviceType),
        datasets: [{
          data: data.deviceTypes.map(d => d.count),
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, padding: 10 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private renderOsChart(data: Dashboard) {
    if (!this.osChartRef?.nativeElement) return;
    const ctx = this.osChartRef.nativeElement.getContext('2d')!;
    const colors = ['#fb923c', '#a78bfa', '#34d399', '#60a5fa', '#f472b6', '#facc15'];

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.operatingSystems.map(o => o.os),
        datasets: [{
          label: 'Clicks',
          data: data.operatingSystems.map(o => o.count),
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
            beginAtZero: true
          }
        }
      }
    }));
  }

  private renderHoursChart(data: Dashboard) {
    if (!this.hoursChartRef?.nativeElement) return;
    const ctx = this.hoursChartRef.nativeElement.getContext('2d')!;

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.peakHours.map(h => `${h.hour}:00`),
        datasets: [{
          label: 'Clicks',
          data: data.peakHours.map(h => h.count),
          backgroundColor: 'rgba(96, 165, 250, 0.45)',
          borderColor: '#60a5fa',
          borderWidth: 1.5,
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 } },
            beginAtZero: true
          }
        }
      }
    }));
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }
}
