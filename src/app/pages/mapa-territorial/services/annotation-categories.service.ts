import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AnnotationCategory } from '../../../models/annotation-category.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnotationCategoriesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/annotation-categories`;

  getAll() {
    return this.http.get<AnnotationCategory[]>(this.base);
  }

  // Retorna ids de anotaciones que pertenecen a las categorías seleccionadas
  resolveAnnotationIds(
    annotationCategories: AnnotationCategory[],
    categoryIds: number[]
  ): number[] {
    return annotationCategories
      .filter(ac => categoryIds.includes(ac.id_category))
      .map(ac => ac.id_annotation);
  }
}