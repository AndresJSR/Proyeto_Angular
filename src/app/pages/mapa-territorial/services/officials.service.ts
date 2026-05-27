import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap, startWith, share } from 'rxjs';
import { Official } from '../models/official.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfficialsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/officials`;

  // Poll cada 10s
  officials$ = interval(10_000).pipe(
    startWith(0),
    switchMap(() => this.http.get<Official[]>(this.base)),
    share()
  );

  getByEntity(entityId: number) {
    return this.http.get<Official[]>(`${this.base}/search?id_entity=${entityId}`);
  }
}