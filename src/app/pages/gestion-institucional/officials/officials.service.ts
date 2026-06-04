import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Official } from './official.model';

@Injectable({ providedIn: 'root' })
export class OfficialsAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/officials`;

  getAll()                         { return this.http.get<Official[]>(this.base); }
  getById(id: number)              { return this.http.get<Official>(`${this.base}/${id}`); }
  create(body: Partial<Official>)  { return this.http.post<Official>(this.base, body); }
  update(id: number, body: Partial<Official>) { return this.http.put<Official>(`${this.base}/${id}`, body); }
  delete(id: number)               { return this.http.delete(`${this.base}/${id}`); }
}