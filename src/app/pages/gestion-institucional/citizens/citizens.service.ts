import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Citizen } from './citizen.model';

@Injectable({ providedIn: 'root' })
export class CitizensService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/citizens`;

  getAll()                            { return this.http.get<Citizen[]>(this.base); }
  getById(id: number)                 { return this.http.get<Citizen>(`${this.base}/${id}`); }
  create(body: Partial<Citizen>)      { return this.http.post<Citizen>(this.base, body); }
  update(id: number, body: Partial<Citizen>) { return this.http.put<Citizen>(`${this.base}/${id}`, body); }
  delete(id: number)                  { return this.http.delete(`${this.base}/${id}`); }
}