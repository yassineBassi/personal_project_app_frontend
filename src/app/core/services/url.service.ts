import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShortenResponse {
  code: string;
}

@Injectable({ providedIn: 'root' })
export class UrlService {
  private readonly base = environment.apiBase;

  constructor(private http: HttpClient) {}

  shorten(url: string): Observable<ShortenResponse> {
    return this.http.post<ShortenResponse>(`${this.base}/shorten`, { url });
  }

  getOriginalUrl(code: string): Observable<string> {
    return this.http.get<string>(`${this.base}/${code}`);
  }
}
