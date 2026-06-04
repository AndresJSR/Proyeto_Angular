import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Category } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/categories`;

  getAll()                          { return this.http.get<Category[]>(this.base); }
  getById(id: number)               { return this.http.get<Category>(`${this.base}/${id}`); }
  create(fd: FormData)              { return this.http.post<Category>(this.base, fd); }
  update(id: number, fd: FormData)  { return this.http.put<Category>(`${this.base}/${id}`, fd); }
  delete(id: number)                { return this.http.delete(`${this.base}/${id}`); }
}