import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ReportRequest, ReportResponse } from '../models/report-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  generateReport(query: string): Observable<ReportResponse> {
    const body: ReportRequest = { query };

    return this.http.post<ReportResponse>(this.apiUrl, body);
  }

  getTestBarReport(): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/test/bar`);
  }
}
