import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Commune } from './commune.model';

@Injectable({ providedIn: 'root' })
export class CommunesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/communes`;

  getAll()                             { return this.http.get<Commune[]>(this.base); }
  getById(id: number)                  { return this.http.get<Commune>(`${this.base}/${id}`); }
  create(body: Partial<Commune>)       { return this.http.post<Commune>(this.base, body); }
  update(id: number, body: Partial<Commune>) { return this.http.put<Commune>(`${this.base}/${id}`, body); }
  delete(id: number)                   { return this.http.delete(`${this.base}/${id}`); }
}