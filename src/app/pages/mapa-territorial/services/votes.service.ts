import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vote } from '../models/vote.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VotesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/votes`;

  getByAnnotation(id_annotation: number) {
    return this.http.get<Vote[]>(`${this.base}/search?id_annotation=${id_annotation}`);
  }

  create(vote: Omit<Vote, 'id_vote'>) {
    return this.http.post<Vote>(this.base, vote);
  }

  update(id_vote: number, vote: Partial<Vote>) {
    return this.http.put<Vote>(`${this.base}/${id_vote}`, vote);
  }
}