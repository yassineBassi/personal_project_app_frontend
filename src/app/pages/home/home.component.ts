import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { UrlService } from '../../core/services/url.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('450ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('resultCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96) translateY(8px)' }),
        animate('380ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'scale(0.96)' }))
      ])
    ]),
    trigger('pulse', [
      state('idle', style({ transform: 'scale(1)' })),
      state('active', style({ transform: 'scale(1.02)' })),
      transition('idle <=> active', animate('150ms ease-in-out'))
    ])
  ],
  template: `
    <div class="home-page">
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="hero" @fadeSlideIn>
        <div class="hero-badge">
          <span class="badge-dot"></span>
          URL Shortener
        </div>
        <h1 class="hero-title">
          Make your links<br>
          <span class="gradient-text">unforgettable</span>
        </h1>
        <p class="hero-subtitle">
          Shorten, share, and track your URLs with beautiful real-time analytics.
        </p>
      </div>

      <div class="shorten-card" @fadeSlideIn>
        <form (ngSubmit)="shorten()" class="shorten-form">
          <div class="input-row">
            <div class="input-wrapper" [class.focused]="inputFocused" [class.has-error]="errorMsg()">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <input
                type="url"
                class="url-input"
                placeholder="https://your-long-url.com/paste/here"
                [(ngModel)]="urlInput"
                name="url"
                (focus)="inputFocused = true"
                (blur)="inputFocused = false"
                required
                autocomplete="off"
              />
            </div>
            <button
              type="submit"
              class="shorten-btn"
              [class.loading]="loading()"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner"></span>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              }
              {{ loading() ? 'Shortening...' : 'Shorten' }}
            </button>
          </div>

          @if (errorMsg()) {
            <div class="error-msg" @fadeSlideIn>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg() }}
            </div>
          }
        </form>
      </div>

      @if (result()) {
        <div class="result-card" @resultCard>
          <div class="result-header">
            <div class="result-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div class="result-title">URL Shortened Successfully</div>
              <div class="result-code-inline">Code: <code>{{ result()!.code }}</code></div>
            </div>
          </div>
          <div class="result-body">
            <div class="result-url-block">
              <span class="short-label">Your short link</span>
              <a class="short-link" [href]="fullShortUrl()" target="_blank">{{ fullShortUrl() }}</a>
            </div>
            <div class="result-actions">
              <button class="action-btn copy-btn" (click)="copyToClipboard()" [class.copied]="copied()">
                @if (copied()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Link
                }
              </button>
              <a class="action-btn analytics-btn" [routerLink]="['/url', result()!.code]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Analytics
              </a>
            </div>
          </div>
        </div>
      }

      <div class="features-grid" @fadeSlideIn>
        <div class="feature-card">
          <div class="feature-icon-wrap" style="--c: rgba(167,139,250,0.15); --s: #a78bfa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h3>Instant Shortening</h3>
          <p>Create short links in milliseconds with a single click</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap" style="--c: rgba(96,165,250,0.15); --s: #60a5fa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h3>Real-time Analytics</h3>
          <p>Track clicks, browsers, devices, and trends live</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap" style="--c: rgba(52,211,153,0.15); --s: #34d399">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>Reliable & Fast</h3>
          <p>Redis-cached redirects for sub-millisecond response times</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 1.5rem 4rem;
      position: relative;
      overflow: hidden;
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
      filter: blur(90px);
      animation: floatOrb 10s ease-in-out infinite;
    }

    .orb-1 {
      width: 560px; height: 560px;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.18), transparent 70%);
      top: -140px; left: -180px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(96, 165, 250, 0.14), transparent 70%);
      top: 30%; right: -120px;
      animation-delay: 3.5s;
    }

    .orb-3 {
      width: 360px; height: 360px;
      background: radial-gradient(circle, rgba(244, 114, 182, 0.1), transparent 70%);
      bottom: 60px; left: 28%;
      animation-delay: 6s;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(22px, -18px) scale(1.04); }
      66% { transform: translate(-14px, 16px) scale(0.97); }
    }

    /* ── Hero ── */
    .hero {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      border-radius: 100px;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.22);
      color: #a78bfa;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .badge-dot {
      width: 6px; height: 6px;
      background: #a78bfa;
      border-radius: 50%;
      animation: blink 2.2s ease infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.6); }
    }

    .hero-title {
      font-size: clamp(2.6rem, 6.5vw, 4.2rem);
      font-weight: 900;
      color: #fff;
      line-height: 1.08;
      margin-bottom: 1.1rem;
      letter-spacing: -0.04em;
    }

    .gradient-text {
      background: linear-gradient(130deg, #a78bfa 0%, #60a5fa 45%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.48);
      max-width: 420px;
      margin: 0 auto;
      line-height: 1.65;
      font-weight: 400;
    }

    /* ── Shorten Card ── */
    .shorten-card {
      width: 100%;
      max-width: 660px;
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.075);
      border-radius: 22px;
      padding: 1.5rem;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      position: relative;
      z-index: 1;
      margin-bottom: 1.25rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .shorten-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .input-row {
      display: flex;
      gap: 0.75rem;
      align-items: stretch;
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(255,255,255,0.045);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 12px;
      padding: 0 1rem;
      height: 48px;
      transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
    }

    .input-wrapper.focused {
      border-color: rgba(167, 139, 250, 0.55);
      background: rgba(167, 139, 250, 0.06);
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
    }

    .input-wrapper.has-error {
      border-color: rgba(248, 113, 113, 0.5);
    }

    .input-icon {
      width: 16px; height: 16px;
      color: rgba(255,255,255,0.28);
      flex-shrink: 0;
      transition: color 0.22s ease;
    }

    .input-wrapper.focused .input-icon {
      color: rgba(167, 139, 250, 0.7);
    }

    .url-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 0.92rem;
      font-family: inherit;
      min-width: 0;
    }

    .url-input::placeholder {
      color: rgba(255,255,255,0.22);
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #f87171;
      font-size: 0.83rem;
      padding-left: 0.2rem;
    }

    .error-msg svg {
      width: 14px; height: 14px;
      flex-shrink: 0;
    }

    .shorten-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0 1.5rem;
      height: 48px;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: -0.01em;
    }

    .shorten-btn svg {
      width: 15px; height: 15px;
    }

    .shorten-btn:hover:not(:disabled) {
      transform: translateY(-1.5px);
      box-shadow: 0 6px 28px rgba(124, 58, 237, 0.5);
    }

    .shorten-btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: none;
    }

    .shorten-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .spinner {
      width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.28);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Result Card ── */
    .result-card {
      width: 100%;
      max-width: 660px;
      background: rgba(16, 185, 129, 0.055);
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: 18px;
      padding: 1.25rem 1.5rem;
      position: relative;
      z-index: 1;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.08);
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .result-check {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(52, 211, 153, 0.15);
      border: 1px solid rgba(52, 211, 153, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .result-check svg {
      width: 16px; height: 16px;
      color: #34d399;
    }

    .result-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #34d399;
      margin-bottom: 0.1rem;
    }

    .result-code-inline {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.35);
    }

    .result-code-inline code {
      font-family: 'SF Mono', Consolas, monospace;
      color: rgba(255,255,255,0.55);
      background: rgba(255,255,255,0.06);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .result-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .result-url-block {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .short-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.38);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }

    .short-link {
      color: #a78bfa;
      font-size: 1rem;
      font-weight: 500;
      transition: color 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .short-link:hover { color: #c4b5fd; }

    .result-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.48rem 1rem;
      border-radius: 9px;
      font-size: 0.84rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .action-btn svg {
      width: 14px; height: 14px;
    }

    .copy-btn {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.75);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .copy-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }

    .copy-btn.copied {
      background: rgba(52, 211, 153, 0.12);
      color: #34d399;
      border-color: rgba(52, 211, 153, 0.25);
    }

    .analytics-btn {
      background: rgba(167, 139, 250, 0.1);
      color: #a78bfa;
      border: 1px solid rgba(167, 139, 250, 0.22);
    }

    .analytics-btn:hover {
      background: rgba(167, 139, 250, 0.18);
      border-color: rgba(167, 139, 250, 0.35);
    }

    /* ── Features ── */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      width: 100%;
      max-width: 660px;
      position: relative;
      z-index: 1;
      margin-top: 1.25rem;
    }

    .feature-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 16px;
      padding: 1.4rem 1.25rem;
      transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }

    .feature-card:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.1);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.3);
    }

    .feature-icon-wrap {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: var(--c);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
    }

    .feature-icon-wrap svg {
      width: 18px; height: 18px;
      color: var(--s);
    }

    .feature-card h3 {
      font-size: 0.88rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.3rem;
      letter-spacing: -0.01em;
    }

    .feature-card p {
      font-size: 0.77rem;
      color: rgba(255,255,255,0.4);
      margin: 0;
      line-height: 1.55;
    }

    @media (max-width: 620px) {
      .features-grid { grid-template-columns: 1fr; }
      .input-row { flex-direction: column; }
      .shorten-btn { height: 46px; width: 100%; }
      .result-body { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class HomeComponent {
  urlInput = '';
  inputFocused = false;

  loading = signal(false);
  errorMsg = signal('');
  result = signal<{ code: string } | null>(null);
  copied = signal(false);

  constructor(private urlService: UrlService) {}

  shorten() {
    if (!this.urlInput.trim()) {
      this.errorMsg.set('Please enter a URL');
      return;
    }

    this.errorMsg.set('');
    this.loading.set(true);
    this.result.set(null);

    this.urlService.shorten(this.urlInput.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        this.urlInput = '';
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to shorten URL. Check the URL and try again.');
        this.loading.set(false);
      }
    });
  }

  fullShortUrl(): string {
    const code = this.result()?.code;
    return code ? `${window.location.origin}/r/${code}` : '';
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.fullShortUrl()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
