import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { AnotacionFormComponent } from '../components/anotacion-form/anotacion-form.component';
import { AnnotationsService } from '../services/annotations.service';
import { BarriosService } from '../services/barrios.service';
import { Annotation } from '../../../models/annotation.model';
import { Barrio } from '../../../models/barrio.model';
import { AnotacionDetalleComponent } from '../components/anotacion-detalle/anotacion-detalle.component';
import { AnnotationCategoriesService } from '../services/annotation-categories.service';
import { EvidencesService } from '../services/evidences.service';
import { Evidence } from '../../../models/evidence.model';

const DEFAULT_COLOR = '#e74c3c';
const BARRIO_DEFAULT_STYLE: L.PathOptions = { color: '#3b82f6', fillColor: '#3b82f6', weight: 2, fillOpacity: 0.12 };
const BARRIO_HOVER_STYLE: L.PathOptions  = { fillOpacity: 0.28 };
const BARRIO_ACTIVE_STYLE: L.PathOptions = { color: '#1d4ed8', fillColor: '#1d4ed8', weight: 2.5, fillOpacity: 0.35 };

@Component({
  selector: 'app-mapa-anotar-page',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MapaBaseComponent,
    AnotacionFormComponent,
    AnotacionDetalleComponent,
  ],
  templateUrl: './mapa-anotar-page.component.html',
  styleUrls: ['./mapa-anotar-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaAnotarPageComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly annotationsService = inject(AnnotationsService);
  private readonly annCatSvc = inject(AnnotationCategoriesService);
  private readonly evidencesSvc = inject(EvidencesService);
  private readonly barriosSvc = inject(BarriosService);
  private readonly destroyRef = inject(DestroyRef);

  formCoords = signal<[number, number] | null>(null);
  showForm = signal(false);
  barrioSeleccionado = signal<Barrio | null>(null);
  selectedAnnotation = signal<Annotation | null>(null);
  sidebarOpen = signal(false);
  hoverAnnotation = signal<Annotation | null>(null);
  hoverPos = signal<{ x: number; y: number } | null>(null);
  hoverEvidence = signal<Evidence | null>(null);

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private markerMap = new Map<number, L.CircleMarker>();
  private barrioPolygons = new Map<number, L.Polygon>();
  private annotationCategoryMap = new Map<number, number>();
  private evidenceCache = new Map<number, Evidence | null>();
  private hoverTimeout?: ReturnType<typeof setTimeout>;
  private readonly filtered$ = toObservable(this.annotationsService.filtered);

  ngOnInit(): void {
    this.annotationsService.loadAll();
    this.annCatSvc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(acs => {
        acs.forEach(ac => {
          if (!this.annotationCategoryMap.has(ac.id_annotation)) {
            this.annotationCategoryMap.set(ac.id_annotation, ac.id_category);
          }
        });
      });
    this.filtered$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(anns => this.renderMarkers(anns));
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    map.on('click', () => this.onMapBackgroundClick());
    this.loadBarriosPolygons();
  }

  onMapClick(_e: L.LeafletMouseEvent): void {}

  onMapBackgroundClick(): void {
    this.hoverAnnotation.set(null);
    this.hoverPos.set(null);
    this.hoverEvidence.set(null);
  }

  private loadBarriosPolygons(): void {
    this.barriosSvc.getAll().pipe(
      switchMap(barrios => {
        if (!barrios.length) return of([]);
        return forkJoin(
          barrios.map(b =>
            this.barriosSvc.getPointsByNeighborhood(b.id_neighborhood).pipe(
              map((res: any) => {
                const items: any[] = Array.isArray(res) ? res : (res.items ?? []);
                const coords = items
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((p: any) => [p.latitude, p.longitude] as [number, number]);
                return { barrio: b, coords };
              }),
              catchError(() => of({ barrio: b, coords: [] as [number, number][] }))
            )
          )
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      results.forEach(({ barrio, coords }) => {
        if (coords.length >= 3) this.renderBarrioPolygon(barrio, coords);
      });
    });
  }

  private renderBarrioPolygon(barrio: Barrio, coords: [number, number][]): void {
    const polygon = L.polygon(coords, { ...BARRIO_DEFAULT_STYLE });

    polygon.on('mouseover', () => {
      if (this.barrioSeleccionado()?.id_neighborhood !== barrio.id_neighborhood) {
        polygon.setStyle(BARRIO_HOVER_STYLE);
      }
      polygon.bindTooltip(barrio.name, { permanent: false, direction: 'top' }).openTooltip();
    });

    polygon.on('mouseout', () => {
      if (this.barrioSeleccionado()?.id_neighborhood !== barrio.id_neighborhood) {
        polygon.setStyle(BARRIO_DEFAULT_STYLE);
      }
      polygon.unbindTooltip();
    });

    polygon.on('click', (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      this.selectBarrio(barrio, e);
    });

    polygon.addTo(this.map!);
    this.barrioPolygons.set(barrio.id_neighborhood, polygon);
  }

  private selectBarrio(barrio: Barrio, e: L.LeafletMouseEvent): void {
    const prev = this.barrioSeleccionado();
    if (prev) {
      this.barrioPolygons.get(prev.id_neighborhood)?.setStyle(BARRIO_DEFAULT_STYLE);
    }

    this.barrioSeleccionado.set(barrio);
    this.barrioPolygons.get(barrio.id_neighborhood)?.setStyle(BARRIO_ACTIVE_STYLE);

    this.formCoords.set([e.latlng.lat, e.latlng.lng]);
    this.showForm.set(true);
    this.sidebarOpen.set(false);
    this.selectedAnnotation.set(null);
    this.clearActiveMarkers();
    this.hoverAnnotation.set(null);
    this.hoverPos.set(null);
  }

  private getColor(annotationId: number): string {
    const catId = this.annotationCategoryMap.get(annotationId);
    if (!catId) return DEFAULT_COLOR;
    const palette = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316'];
    return palette[catId % palette.length];
  }

  private loadHoverEvidence(annotationId: number): void {
    if (this.evidenceCache.has(annotationId)) {
      this.hoverEvidence.set(this.evidenceCache.get(annotationId) ?? null);
      return;
    }
    this.evidencesSvc.getByAnnotation(annotationId).subscribe({
      next: evs => {
        const first = evs?.[0] ?? null;
        this.evidenceCache.set(annotationId, first);
        if (this.hoverAnnotation()?.id_annotation === annotationId) {
          this.hoverEvidence.set(first);
        }
      },
      error: () => {
        this.evidenceCache.set(annotationId, null);
        this.hoverEvidence.set(null);
      }
    });
  }

  resolveImageUrl(fileUrl: string): string {
    return this.evidencesSvc.resolveImageUrl(fileUrl);
  }

  private renderMarkers(annotations: Annotation[]) {
    if (!this.map) return;
    if (!this.markersLayer) {
      this.markersLayer = L.layerGroup().addTo(this.map);
    }
    this.markersLayer.clearLayers();
    this.markerMap.clear();

    annotations.forEach(a => {
      const color = this.getColor(a.id_annotation);
      const marker = L.circleMarker([a.latitude, a.longitude], {
        radius: 9,
        fillColor: color,
        color: '#fff',
        weight: 2.5,
        fillOpacity: 0.9,
      });

      marker.on('mouseover', (e: L.LeafletMouseEvent) => {
        const selected = this.selectedAnnotation();
        if (selected?.id_annotation === a.id_annotation) return;
        marker.setStyle({ radius: 13, weight: 3 } as any);
        this.hoverAnnotation.set(a);
        this.hoverEvidence.set(null);
        const point = this.map!.latLngToContainerPoint(e.latlng);
        this.hoverPos.set({ x: point.x, y: point.y });
        this.loadHoverEvidence(a.id_annotation);
      });

      marker.on('mouseout', () => {
        const selected = this.selectedAnnotation();
        if (selected?.id_annotation !== a.id_annotation) {
          marker.setStyle({ radius: 9, weight: 2.5 } as any);
        }
        this.hoverTimeout = setTimeout(() => {
          this.hoverAnnotation.set(null);
          this.hoverPos.set(null);
          this.hoverEvidence.set(null);
        }, 120);
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        clearTimeout(this.hoverTimeout);
        this.hoverAnnotation.set(null);
        this.hoverPos.set(null);
        this.hoverEvidence.set(null);
        this.clearActiveMarkers();
        marker.setStyle({ radius: 14, weight: 3 } as any);
        this.selectedAnnotation.set(a);
        this.sidebarOpen.set(true);
        this.showForm.set(false);
        this.formCoords.set(null);
      });

      marker.addTo(this.markersLayer!);
      this.markerMap.set(a.id_annotation, marker);
    });
  }

  private clearActiveMarkers() {
    this.markerMap.forEach(m => m.setStyle({ radius: 9, weight: 2.5 } as any));
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.selectedAnnotation.set(null);
    this.clearActiveMarkers();
  }

  onAnnotationDeleted(id: number): void {
    const marker = this.markerMap.get(id);
    if (marker && this.markersLayer) {
      this.markersLayer.removeLayer(marker);
      this.markerMap.delete(id);
    }
    this.sidebarOpen.set(false);
    this.selectedAnnotation.set(null);
  }

  onFormSaved(_id: number): void {
    this.showForm.set(false);
    this.formCoords.set(null);
    const prev = this.barrioSeleccionado();
    if (prev) this.barrioPolygons.get(prev.id_neighborhood)?.setStyle(BARRIO_DEFAULT_STYLE);
    this.barrioSeleccionado.set(null);
  }

  onFormClosed(): void {
    this.showForm.set(false);
    this.formCoords.set(null);
    const prev = this.barrioSeleccionado();
    if (prev) this.barrioPolygons.get(prev.id_neighborhood)?.setStyle(BARRIO_DEFAULT_STYLE);
    this.barrioSeleccionado.set(null);
  }
}
