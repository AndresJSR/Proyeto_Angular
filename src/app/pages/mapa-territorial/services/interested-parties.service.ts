import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InterestedPartiesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/interested-parties`;

  create(id_entity: number, id_annotation: number) {
    return this.http.post(this.base, { id_entity, id_annotation });
  }
}