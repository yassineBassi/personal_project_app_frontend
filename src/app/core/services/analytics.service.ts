import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  totalClicks: number;
  totalUrls: number;
  uniqueVisitors: number;
  avgClicksPerUrl: number;
}

export interface DashboardActivity {
  clicksLast24h: number;
  clicksPrev24h: number;
  growthRate: number;
}

export interface TopUrl {
  code: string;
  originalUrl: string;
  clickCount: number;
}

export interface TrendDay {
  date: string;
  clicks: number;
}

export interface BrowserStat {
  browser: string;
  count: number;
}

export interface PeakHour {
  hour: number;
  count: number;
}

export interface Dashboard {
  summary: DashboardSummary;
  activity: DashboardActivity;
  topUrls: TopUrl[];
  trend: TrendDay[];
  browsers: BrowserStat[];
  peakHours: PeakHour[];
}

export interface UrlAnalytics {
  code: string;
  clickCount: number;
  clicks: {
    id: string;
    clientIp: string;
    clientBrowser: string;
    time: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly base = environment.analyticsBase;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.base}/dashboard`);
  }

  getUrlAnalytics(code: string): Observable<UrlAnalytics> {
    return this.http.get<UrlAnalytics>(`${this.base}/${code}`);
  }
}
