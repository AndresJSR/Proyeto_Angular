import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Annotation } from '../../../models/annotation.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnotationsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/annotations`;

  all = signal<Annotation[]>([]);
  filtered = signal<Annotation[]>([]);
  loading = signal(false);

  private page = 1;
  private pageSize = 50;
  private hasMore = true;

  loadAll() {
    this.page = 1;
    this.hasMore = true;
    this.all.set([]);
    this.filtered.set([]);
    this.loadPage();
  }

  loadMore() {
    if (!this.hasMore || this.loading()) return;
    this.loadPage();
  }

  private loadPage() {
    this.loading.set(true);
    this.http.get<Annotation[]>(this.base).subscribe({
      next: data => {
        this.hasMore = false;
        this.all.set(data);
        this.filtered.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  removeFromCache(id: number) {
    this.all.update(list => list.filter(a => a.id_annotation !== id));
    this.filtered.update(list => list.filter(a => a.id_annotation !== id));
  }

  applyFilter(allowedIds: number[] | null) {
    if (allowedIds === null) {
      this.filtered.set(this.all());
    } else {
      this.filtered.set(this.all().filter(a => allowedIds.includes(a.id_annotation)));
    }
  }
}