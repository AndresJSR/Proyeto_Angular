import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Annotation, PaginatedResponse } from '../models/annotation.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnotationsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/annotations`;

  // Señales reactivas — CU-14
  all = signal<Annotation[]>([]);
  filtered = signal<Annotation[]>([]);

  loadAll() {
    return this.http.get<Annotation[]>(this.base).subscribe(data => {
      this.all.set(data);
      this.filtered.set(data);
    });
  }

  getById(id: number) {
    return this.http.get<Annotation>(`${this.base}/${id}`);
  }

  // Filtrado local por ids resueltos desde annotation-categories
  applyFilter(allowedIds: number[] | null) {
    if (allowedIds === null) {
      this.filtered.set(this.all());
    } else {
      this.filtered.set(this.all().filter(a => allowedIds.includes(a.id_annotation)));
    }
  }
}