import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <a class="navbar-brand" routerLink="/">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span class="brand-name">ShortLink</span>
      </a>

      <div class="navbar-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Shorten
        </a>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Dashboard
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 58px;
      background: rgba(7, 7, 15, 0.82);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-bottom: 1px solid rgba(255,255,255,0.055);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
    }

    .brand-logo {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 14px rgba(124, 58, 237, 0.45);
    }

    .brand-logo svg {
      width: 15px;
      height: 15px;
      color: #fff;
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #fff;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      color: rgba(255,255,255,0.48);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.18s ease, background 0.18s ease;
    }

    .nav-link svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      transition: color 0.18s ease;
    }

    .nav-link:hover {
      color: rgba(255,255,255,0.85);
      background: rgba(255,255,255,0.06);
    }

    .nav-link.active {
      color: #fff;
      background: rgba(167, 139, 250, 0.12);
    }

    .nav-link.active svg {
      color: #a78bfa;
    }
  `]
})
export class NavbarComponent {}
