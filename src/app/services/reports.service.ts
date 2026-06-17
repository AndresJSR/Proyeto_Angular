import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  ReportErrorResponse,
  ReportRequest,
  ReportResponse,
} from '../models/report-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  generateReport(query: string): Observable<ReportResponse> {
    const payload: ReportRequest = {
      query: query.trim(),
    };

    return this.http
      .post<ReportResponse>(this.baseUrl, payload)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const fallbackError: ReportErrorResponse = {
      statusCode: error.status,
      message: this.getErrorMessage(error),
      error: error.statusText,
    };

    return throwError(() => fallbackError);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return 'No fue posible interpretar esta consulta. Intenta reformularla o usa una de las preguntas sugeridas.';
    }

    if (error.status === 422) {
      return 'No fue posible interpretar la consulta. Intenta reformularla.';
    }

    if (error.status === 500) {
      return 'Ocurrió un error interno procesando el reporte.';
    }

    if (error.status === 502) {
      return 'No fue posible comunicarse con el servicio de inteligencia artificial.';
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return 'No se pudo generar el reporte. Intenta nuevamente.';
  }
}
