import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Evidence } from '../models/evidence.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EvidencesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/evidences`;

  getByAnnotation(id_annotation: number) {
    return this.http.get<Evidence[]>(
      `${this.base}/search?id_annotation=${id_annotation}`
    );
  }

  upload(id_annotation: number, file: File) {
    const fd = new FormData();
    fd.append('id_annotation', String(id_annotation));
    fd.append('file_type', file.type);
    fd.append('file_size', String(file.size));
    fd.append('file', file);
    return this.http.post(this.base, fd);
  }

  delete(id_evidence: number) {
    return this.http.delete(`${this.base}/${id_evidence}`);
  }
}