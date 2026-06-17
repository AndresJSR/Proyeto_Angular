import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Neighborhood } from '../../../models/neighborhood.model';

@Injectable({ providedIn: 'root' })
export class NeighborhoodsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/neighborhoods`;

  getAll()                                   { return this.http.get<Neighborhood[]>(this.base); }
  getById(id: number)                        { return this.http.get<Neighborhood>(`${this.base}/${id}`); }
  create(body: Partial<Neighborhood>)        { return this.http.post<Neighborhood>(this.base, body); }
  update(id: number, body: Partial<Neighborhood>) { return this.http.put<Neighborhood>(`${this.base}/${id}`, body); }
  delete(id: number)                         { return this.http.delete(`${this.base}/${id}`); }
  searchByCommune(id_commune: number)        { return this.http.get<Neighborhood[]>(`${this.base}/search?id_commune=${id_commune}`); }
}