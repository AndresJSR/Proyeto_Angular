import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Entity } from './entity.model';

@Injectable({ providedIn: 'root' })
export class EntitiesAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/entities`;

  getAll()                      { return this.http.get<Entity[]>(this.base); }
  getById(id: number)           { return this.http.get<Entity>(`${this.base}/${id}`); }
  create(fd: FormData)          { return this.http.post<Entity>(this.base, fd); }
  update(id: number, fd: FormData) { return this.http.put<Entity>(`${this.base}/${id}`, fd); }
  delete(id: number)            { return this.http.delete(`${this.base}/${id}`); }
}