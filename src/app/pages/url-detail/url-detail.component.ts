import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AnalyticsService, UrlAnalytics } from '../../core/services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-url-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="detail-page">
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
      </div>

      <div class="back-nav" @fadeIn>
        <a routerLink="/dashboard" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </a>
      </div>

      @if (loading()) {
        <div class="loading-state" @fadeIn>
          <div class="loading-spinner-large"></div>
          <p>Loading URL analytics...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state" @fadeIn>
          <div class="error-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadAnalytics()">Retry</button>
        </div>
      }

      @if (analytics(); as data) {
        <div class="detail-header" @fadeIn>
          <div class="header-left">
            <div class="code-eyebrow">Short Code</div>
            <code class="code-value">{{ data.code }}</code>
          </div>
          <div class="header-right">
            <div class="click-number">{{ data.clickCount | number }}</div>
            <div class="click-label">Total Clicks</div>
          </div>
        </div>

        <div class="charts-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Clicks Over Time</span>
            </div>
            <div class="chart-wrapper">
              <canvas #timelineChart></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Browser Distribution</span>
            </div>
            <div class="chart-wrapper">
              <canvas #browserChart></canvas>
            </div>
          </div>
        </div>

        <div class="charts-row charts-row-equal" @fadeIn>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Device Types</span>
            </div>
            <div class="chart-wrapper">
              <canvas #deviceChart></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Operating System</span>
            </div>
            <div class="chart-wrapper">
              <canvas #osChart></canvas>
            </div>
          </div>
        </div>

        <div class="clicks-table-card" @fadeIn>
          <div class="table-header">
            <span class="chart-title">Recent Clicks</span>
            <div class="table-count-badge">{{ data.clicks.length }} records</div>
          </div>

          @if (data.clicks.length > 0) {
            <div class="table-wrapper">
              <table class="clicks-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>OS</th>
                    <th>Browser</th>
                  </tr>
                </thead>
                <tbody>
                  @for (click of data.clicks.slice().reverse().slice(0, 50); track click.id; let i = $index) {
                    <tr>
                      <td class="row-num">{{ i + 1 }}</td>
                      <td class="time-cell">{{ click.time | date:'MMM d, y HH:mm:ss' }}</td>
                      <td class="ip-cell">{{ click.clientIp || 'Unknown' }}</td>
                      <td class="device-cell">
                        <span class="device-badge">{{ click.clientDeviceType || 'Unknown' }}</span>
                      </td>
                      <td class="os-cell">{{ click.clientOS || 'Unknown' }}</td>
                      <td class="browser-cell">{{ click.clientBrowser | slice:0:55 }}{{ click.clientBrowser.length > 55 ? '…' : '' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-msg">No clicks recorded yet</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      min-height: 100vh;
      padding: 5.5rem 1.75rem 3.5rem;
      max-width: 1140px;
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
      filter: blur(120px);
    }

    .orb-1 {
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.09), transparent 70%);
      top: -300px; left: 50%;
      transform: translateX(-50%);
    }

    /* ── Back nav ── */
    .back-nav {
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: rgba(255,255,255,0.38);
      font-size: 0.86rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .back-link svg {
      width: 16px; height: 16px;
    }

    .back-link:hover { color: rgba(255,255,255,0.75); }

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

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: rgba(248, 113, 113, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-icon-wrap svg {
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

    .retry-btn:hover { background: rgba(167, 139, 250, 0.18); }

    /* ── Detail Header ── */
    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 22px;
      padding: 2rem 2.5rem;
      position: relative;
      z-index: 1;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .header-left {}

    .code-eyebrow {
      font-size: 0.72rem;
      font-weight: 600;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.4rem;
    }

    .code-value {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 2.2rem;
      color: #a78bfa;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .header-right { text-align: right; }

    .click-number {
      font-size: 3.2rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 0.3rem;
    }

    .click-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255,255,255,0.38);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    /* ── Charts ── */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .charts-row-equal {
      grid-template-columns: 1fr 1fr;
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
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.48);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .chart-wrapper {
      position: relative;
      height: 220px;
    }

    /* ── Table Card ── */
    .clicks-table-card {
      background: rgba(255,255,255,0.028);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 20px;
      padding: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .table-count-badge {
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 0.2rem 0.7rem;
      border-radius: 100px;
    }

    .table-wrapper { overflow-x: auto; }

    .clicks-table {
      width: 100%;
      border-collapse: collapse;
    }

    .clicks-table th {
      text-align: left;
      padding: 0.55rem 0.9rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      white-space: nowrap;
    }

    .clicks-table td {
      padding: 0.7rem 0.9rem;
      font-size: 0.83rem;
      color: rgba(255,255,255,0.65);
      border-bottom: 1px solid rgba(255,255,255,0.028);
    }

    .clicks-table tbody tr:last-child td { border-bottom: none; }

    .clicks-table tbody tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    .row-num {
      color: rgba(255,255,255,0.2) !important;
      font-size: 0.72rem !important;
      width: 28px;
      font-weight: 600;
    }

    .time-cell {
      color: rgba(255,255,255,0.55) !important;
      white-space: nowrap;
      font-size: 0.8rem !important;
    }

    .ip-cell {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.78rem !important;
      color: rgba(255,255,255,0.55) !important;
    }

    .device-cell { white-space: nowrap; }

    .device-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.18rem 0.6rem;
      border-radius: 100px;
      background: rgba(96, 165, 250, 0.1);
      color: #60a5fa;
      border: 1px solid rgba(96, 165, 250, 0.2);
      text-transform: capitalize;
    }

    .os-cell {
      font-size: 0.8rem !important;
      color: rgba(255,255,255,0.5) !important;
    }

    .browser-cell {
      color: rgba(255,255,255,0.35) !important;
      font-size: 0.76rem !important;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-msg {
      text-align: center;
      color: rgba(255,255,255,0.28);
      padding: 3rem;
      font-size: 0.875rem;
    }

    @media (max-width: 720px) {
      .charts-row { grid-template-columns: 1fr; }
      .charts-row-equal { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; gap: 1.25rem; align-items: flex-start; padding: 1.5rem; }
      .header-right { text-align: left; }
      .detail-page { padding-left: 1rem; padding-right: 1rem; }
    }
  `]
})
export class UrlDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('timelineChart') timelineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('browserChart') browserChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deviceChart') deviceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('osChart') osChartRef!: ElementRef<HTMLCanvasElement>;

  loading = signal(false);
  error = signal('');
  analytics = signal<UrlAnalytics | null>(null);
  code = '';

  private charts: Chart[] = [];

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') || '';
    this.loadAnalytics();
  }

  ngAfterViewInit() {}

  loadAnalytics() {
    if (!this.code) return;
    this.loading.set(true);
    this.error.set('');

    this.analyticsService.getUrlAnalytics(this.code).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(data), 100);
      },
      error: (err) => {
        this.error.set('Failed to load analytics for this URL.');
        this.loading.set(false);
      }
    });
  }

  private renderCharts(data: UrlAnalytics) {
    this.destroyCharts();
    this.renderTimeline(data);
    this.renderBrowserChart(data);
    this.renderDeviceChart(data);
    this.renderOsChart(data);
  }

  private renderTimeline(data: UrlAnalytics) {
    if (!this.timelineChartRef?.nativeElement) return;
    const ctx = this.timelineChartRef.nativeElement.getContext('2d')!;

    const byDay: Record<string, number> = {};
    data.clicks.forEach(click => {
      const day = new Date(click.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const labels = Object.keys(byDay);
    const values = Object.values(byDay);

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Clicks',
          data: values,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#a78bfa',
          pointRadius: 4
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

  private renderBrowserChart(data: UrlAnalytics) {
    if (!this.browserChartRef?.nativeElement) return;
    const ctx = this.browserChartRef.nativeElement.getContext('2d')!;

    const browsers: Record<string, number> = {};
    data.clicks.forEach(click => {
      const browser = (click.clientBrowser || 'Unknown').substring(0, 20);
      browsers[browser] = (browsers[browser] || 0) + 1;
    });

    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(browsers),
        datasets: [{
          data: Object.values(browsers),
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
            labels: { color: 'rgba(255,255,255,0.4)', font: { size: 9 }, padding: 8 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private renderDeviceChart(data: UrlAnalytics) {
    if (!this.deviceChartRef?.nativeElement) return;
    const ctx = this.deviceChartRef.nativeElement.getContext('2d')!;

    const devices: Record<string, number> = {};
    data.clicks.forEach(click => {
      const d = click.clientDeviceType || 'Unknown';
      devices[d] = (devices[d] || 0) + 1;
    });

    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(devices),
        datasets: [{
          data: Object.values(devices),
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
            labels: { color: 'rgba(255,255,255,0.4)', font: { size: 9 }, padding: 8 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private renderOsChart(data: UrlAnalytics) {
    if (!this.osChartRef?.nativeElement) return;
    const ctx = this.osChartRef.nativeElement.getContext('2d')!;

    const osCounts: Record<string, number> = {};
    data.clicks.forEach(click => {
      const os = click.clientOS || 'Unknown';
      osCounts[os] = (osCounts[os] || 0) + 1;
    });

    const colors = ['#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(osCounts),
        datasets: [{
          data: Object.values(osCounts),
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
            labels: { color: 'rgba(255,255,255,0.4)', font: { size: 9 }, padding: 8 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }
}
