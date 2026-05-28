import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, switchMap, timer } from 'rxjs';
import { Official } from '../models/official.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfficialsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/officials`;

  startPolling(intervalMs = 10_000): Observable<Official[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<Official[]>(this.base)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getByEntity(entityId: number) {
    return this.http.get<Official[]>(`${this.base}/search?id_entity=${entityId}`);
  }
}