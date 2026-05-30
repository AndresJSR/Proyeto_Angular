import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Barrio } from '../models/barrio.model';
import { forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BarriosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/neighborhoods`;
  private pointsBase = `${environment.apiUrl}/api/points`;

  getAll() {
    return this.http.get<Barrio[]>(this.base);
  }

  getPointsByNeighborhood(id: number) {
    return this.http.get<any[]>(
      `${this.pointsBase}/search?id_neighborhood=${id}`
    );
  }

  savePolygon(id_neighborhood: number, coords: [number, number][]) {
    const requests = coords.map((c, i) =>
      this.http.post(this.pointsBase, {
        id_neighborhood,
        latitude: c[0],
        longitude: c[1],
        order: i + 1,
        point_type: 'boundary'
      })
    );
    return forkJoin(requests);
  }

  deletePoint(id_point: number) {
    return this.http.delete(`${this.pointsBase}/${id_point}`);
  }
}