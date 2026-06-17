import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { NeighborhoodSearchResult } from '../../../models/annotation.model';
import { EvidencesService } from './evidences.service';
import { InterestedPartiesService } from './interested-parties.service';
import { AnnotationsService } from './annotations.service';
import { environment } from '../../../../environments/environment';

export interface CreateAnnotationPayload {
  id_neighborhood: number;
  id_citizen: number;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface SaveRelationsOpts {
  categoryIds: number[];
  entityIds: number[];
  files: File[];
}

@Injectable({ providedIn: 'root' })
export class AnotacionFormService {
  private readonly http = inject(HttpClient);
  private readonly evidencesService = inject(EvidencesService);
  private readonly interestedPartiesService = inject(InterestedPartiesService);
  private readonly annotationsService = inject(AnnotationsService);
  private readonly baseUrl = environment.apiUrl;

  searchNeighborhood(lat: number, lng: number): Observable<NeighborhoodSearchResult[]> {
    return this.http.get<NeighborhoodSearchResult[]>(
      `${this.baseUrl}/api/neighborhoods/search?lat=${lat}&lng=${lng}`
    );
  }

  createAnnotation(payload: CreateAnnotationPayload): Observable<{ id_annotation: number }> {
    return this.http.post<{ id_annotation: number }>(`${this.baseUrl}/api/annotations`, payload);
  }

  saveRelations(id_annotation: number, opts: SaveRelationsOpts): Observable<void> {
    const categories$ = opts.categoryIds.map(id_category =>
      this.http.post(`${this.baseUrl}/api/annotation-categories`, {
        id_category,
        id_annotation,
      })
    );

    const entities$ = opts.entityIds.map(id_entity =>
      this.interestedPartiesService.create(id_entity, id_annotation)
    );

    const files$ = opts.files.map(file =>
      this.evidencesService.upload(id_annotation, file)
    );

    const tasks = [...categories$, ...entities$, ...files$];
    if (!tasks.length) {
      return of(undefined);
    }

    return forkJoin(tasks).pipe(map(() => undefined));
  }

  saveAll(
    coords: [number, number],
    payload: CreateAnnotationPayload,
    opts: SaveRelationsOpts
  ): Observable<number> {
    const annotationPayload: CreateAnnotationPayload = {
      ...payload,
      latitude: coords[0],
      longitude: coords[1],
    };

    return this.createAnnotation(annotationPayload).pipe(
      switchMap(({ id_annotation }) =>
        this.saveRelations(id_annotation, opts).pipe(map(() => id_annotation))
      )
    );
  }

  loadAllAnnotations(): void {
    this.annotationsService.loadAll();
  }
}