import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Category } from '../../../models/category.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/categories`;

  getAll() {
    return this.http.get<Category[]>(this.base);
  }

  // Construye árbol jerárquico desde lista plana
  getTree() {
    return this.getAll().pipe(
      map(cats => {
        const map_ = new Map<number, Category>();
        cats.forEach(c => map_.set(c.id_category, { ...c, children: [] }));
        const roots: Category[] = [];
        map_.forEach(c => {
          if (c.id_parent_category === null) {
            roots.push(c);
          } else {
            map_.get(c.id_parent_category)?.children?.push(c);
          }
        });
        return roots;
      })
    );
  }
}