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
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
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
          <span class="refresh-icon">↻</span>
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
          <div class="error-icon">⚠️</div>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadDashboard()">Retry</button>
        </div>
      }

      @if (dashboard(); as data) {
        <!-- Summary Stats -->
        <div class="stats-grid" @fadeIn>
          <div class="stat-card" style="--accent: #a78bfa">
            <div class="stat-icon">🔗</div>
            <div class="stat-value">{{ data.summary.totalUrls | number }}</div>
            <div class="stat-label">Total URLs</div>
          </div>
          <div class="stat-card" style="--accent: #60a5fa">
            <div class="stat-icon">👆</div>
            <div class="stat-value">{{ data.summary.totalClicks | number }}</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-card" style="--accent: #34d399">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ data.summary.uniqueVisitors | number }}</div>
            <div class="stat-label">Unique Visitors</div>
          </div>
          <div class="stat-card" style="--accent: #f472b6">
            <div class="stat-icon">📈</div>
            <div class="stat-value">{{ data.summary.avgClicksPerUrl | number:'1.1-1' }}</div>
            <div class="stat-label">Avg Clicks/URL</div>
          </div>
        </div>

        <!-- Activity Row -->
        <div class="activity-row" @fadeIn>
          <div class="activity-card">
            <div class="activity-header">
              <span>Last 24 Hours</span>
              <span class="growth-badge" [class.positive]="data.activity.growthRate >= 0" [class.negative]="data.activity.growthRate < 0">
                {{ data.activity.growthRate >= 0 ? '↑' : '↓' }} {{ data.activity.growthRate | number:'1.1-1' }}%
              </span>
            </div>
            <div class="activity-numbers">
              <div class="activity-current">{{ data.activity.clicksLast24h | number }}</div>
              <div class="activity-prev">vs {{ data.activity.clicksPrev24h | number }} prev. 24h</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row" @fadeIn>
          <div class="chart-card wide">
            <div class="chart-title">30-Day Click Trend</div>
            <div class="chart-wrapper">
              <canvas #trendChart></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Browser Breakdown</div>
            <div class="chart-wrapper">
              <canvas #browserChart></canvas>
            </div>
          </div>
        </div>

        <!-- Device Types + OS Breakdown -->
        <div class="charts-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-title">Device Types</div>
            <div class="chart-wrapper">
              <canvas #deviceChart></canvas>
            </div>
          </div>
          <div class="chart-card wide">
            <div class="chart-title">Operating Systems</div>
            <div class="chart-wrapper">
              <canvas #osChart></canvas>
            </div>
          </div>
        </div>

        <!-- Peak Hours + Top URLs -->
        <div class="bottom-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-title">Peak Hours</div>
            <div class="chart-wrapper">
              <canvas #hoursChart></canvas>
            </div>
          </div>

          <div class="top-urls-card">
            <div class="chart-title">Top URLs</div>
            <div class="top-urls-list">
              @for (url of data.topUrls; track url.code; let i = $index) {
                <a class="top-url-item" [routerLink]="['/url', url.code]">
                  <div class="url-rank">{{ i + 1 }}</div>
                  <div class="url-info">
                    <div class="url-code">{{ url.code }}</div>
                    <div class="url-original">{{ url.originalUrl | slice:0:40 }}{{ url.originalUrl.length > 40 ? '...' : '' }}</div>
                  </div>
                  <div class="url-clicks">
                    <span>{{ url.clickCount | number }}</span>
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
      padding: 5.5rem 1.5rem 3rem;
      max-width: 1200px;
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
      filter: blur(100px);
      opacity: 0.08;
    }

    .orb-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, #7c3aed, transparent);
      top: -200px;
      right: -200px;
    }

    .orb-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #2563eb, transparent);
      bottom: -100px;
      left: -100px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.02em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    .refresh-icon {
      display: inline-block;
      transition: transform 0.3s;
    }

    .refresh-btn.spinning .refresh-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 300px;
      color: rgba(255,255,255,0.5);
      position: relative;
      z-index: 1;
    }

    .loading-spinner-large {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(167, 139, 250, 0.2);
      border-top-color: #a78bfa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .error-icon { font-size: 2rem; }

    .retry-btn {
      padding: 0.5rem 1.5rem;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.3);
      border-radius: 8px;
      color: #a78bfa;
      cursor: pointer;
      font-family: inherit;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .stat-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent);
      opacity: 0.6;
    }

    .stat-card:hover {
      background: rgba(255,255,255,0.05);
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.1);
    }

    .stat-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .activity-row {
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .activity-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
    }

    .growth-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .growth-badge.positive {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
    }

    .growth-badge.negative {
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
    }

    .activity-current {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.03em;
    }

    .activity-prev {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.35);
      margin-top: 0.2rem;
    }

    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
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
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .chart-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chart-wrapper {
      position: relative;
      height: 220px;
    }

    .top-urls-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .top-urls-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .top-url-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .top-url-item:hover {
      background: rgba(167, 139, 250, 0.06);
      border-color: rgba(167, 139, 250, 0.15);
    }

    .url-rank {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.4);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .url-info {
      flex: 1;
      min-width: 0;
    }

    .url-code {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.85rem;
      color: #a78bfa;
      font-weight: 600;
      margin-bottom: 0.1rem;
    }

    .url-original {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .url-clicks {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
    }

    .clicks-label {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.3);
      font-weight: 400;
    }

    .empty-msg {
      text-align: center;
      color: rgba(255,255,255,0.3);
      padding: 2rem;
      font-size: 0.9rem;
    }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .bottom-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 500px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
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
          borderRadius: 4
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
          backgroundColor: 'rgba(96, 165, 250, 0.5)',
          borderColor: '#60a5fa',
          borderWidth: 1,
          borderRadius: 4
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
