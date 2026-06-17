import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity } from '../../../models/entity.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EntitiesService {
  private http = inject(HttpClient);
  getAll() {
    return this.http.get<Entity[]>(`${environment.apiUrl}/api/entities`);
  }
}