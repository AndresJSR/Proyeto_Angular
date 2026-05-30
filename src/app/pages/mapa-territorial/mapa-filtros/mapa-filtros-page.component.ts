import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { forkJoin } from 'rxjs';
import { AnotacionDetalleComponent } from '../components/anotacion-detalle/anotacion-detalle.component';
import { FiltrosPanelComponent } from '../components/filtros-panel/filtros-panel.component';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { MAPA_BASE_LAYERS } from '../components/mapa-base/mapa-base-layers';
import { AnnotationCategory } from '../models/annotation-category.model';
import { Annotation } from '../models/annotation.model';
import { Category } from '../models/category.model';
import { AnnotationCategoriesService } from '../services/annotation-categories.service';
import { AnnotationsService } from '../services/annotations.service';
import { CategoriesService } from '../services/categories.service';

const DEFAULT_MARKER_COLOR = '#64748b';
const CATEGORY_PALETTE = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#ca8a04',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#ea580c',
];

@Component({
  selector: 'app-mapa-filtros-page',
  standalone: true,
  imports: [
    CommonModule,
    MapaBaseComponent,
    FiltrosPanelComponent,
    AnotacionDetalleComponent,
  ],
  templateUrl: './mapa-filtros-page.component.html',
  styleUrls: ['./mapa-filtros-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaFiltrosPageComponent implements OnInit, OnDestroy {
  private readonly annotationsService = inject(AnnotationsService);
  private readonly annotationCategoriesService = inject(AnnotationCategoriesService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly layers = MAPA_BASE_LAYERS;
  readonly filtered = this.annotationsService.filtered;
  readonly loading = this.annotationsService.loading;
  readonly selectedAnnotation = signal<Annotation | null>(null);

  private readonly filtered$ = toObservable(this.annotationsService.filtered);
  private readonly categoryById = new Map<number, Category>();
  private readonly annotationCategoryIds = new Map<number, number[]>();
  private readonly rootColorById = new Map<number, string>();
  private readonly markerByAnnotationId = new Map<number, L.CircleMarker>();

  private map?: L.Map;
  private clusterGroup?: L.MarkerClusterGroup;

  ngOnInit(): void {
    this.loadCategoryLookups();
    this.annotationsService.loadAll();

    this.filtered$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((annotations) => this.renderMarkers(annotations));
  }

  ngOnDestroy(): void {
    this.clusterGroup?.clearLayers();
    if (this.map && this.clusterGroup) {
      this.map.removeLayer(this.clusterGroup);
    }
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    this.clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17,
    });
    this.clusterGroup.addTo(map);
    this.renderMarkers(this.filtered());
  }

  onMapClick(): void {
    this.closeDetail();
  }

  closeDetail(): void {
    this.selectedAnnotation.set(null);
    this.clearActiveMarkers();
  }

  private loadCategoryLookups(): void {
    forkJoin({
      categories: this.categoriesService.getAll(),
      annotationCategories: this.annotationCategoriesService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ categories, annotationCategories }) => {
        this.categoryById.clear();
        categories.forEach((category) => this.categoryById.set(category.id_category, category));

        this.annotationCategoryIds.clear();
        annotationCategories.forEach((item) => this.addAnnotationCategory(item));

        this.rootColorById.clear();
        categories
          .filter((category) => category.id_parent_category === null)
          .forEach((category, index) => {
            this.rootColorById.set(
              category.id_category,
              CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
            );
          });

        this.renderMarkers(this.filtered());
      });
  }

  private addAnnotationCategory(item: AnnotationCategory): void {
    const ids = this.annotationCategoryIds.get(item.id_annotation) ?? [];
    ids.push(item.id_category);
    this.annotationCategoryIds.set(item.id_annotation, ids);
  }

  private renderMarkers(annotations: Annotation[]): void {
    if (!this.clusterGroup) return;

    this.clusterGroup.clearLayers();
    this.markerByAnnotationId.clear();

    const markers = annotations
      .filter((annotation) => this.hasValidCoords(annotation))
      .map((annotation) => this.createMarker(annotation));

    this.clusterGroup.addLayers(markers);
  }

  private createMarker(annotation: Annotation): L.CircleMarker {
    const marker = L.circleMarker([annotation.latitude, annotation.longitude], {
      radius: 9,
      fillColor: this.getAnnotationColor(annotation.id_annotation),
      color: '#ffffff',
      weight: 2.5,
      fillOpacity: 0.92,
    });

    marker.on('click', (event: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(event);
      this.clearActiveMarkers();
      marker.setStyle({ radius: 13, weight: 3.5 });
      this.selectedAnnotation.set(annotation);
    });

    marker.bindTooltip(this.getMarkerLabel(annotation), {
      direction: 'top',
      offset: [0, -8],
      opacity: 0.92,
    });

    this.markerByAnnotationId.set(annotation.id_annotation, marker);
    return marker;
  }

  private getAnnotationColor(annotationId: number): string {
    const categoryIds = this.annotationCategoryIds.get(annotationId) ?? [];
    const rootId = categoryIds
      .map((categoryId) => this.getRootCategoryId(categoryId))
      .find((categoryId): categoryId is number => categoryId !== null);

    if (!rootId) return DEFAULT_MARKER_COLOR;

    if (!this.rootColorById.has(rootId)) {
      this.rootColorById.set(
        rootId,
        CATEGORY_PALETTE[this.rootColorById.size % CATEGORY_PALETTE.length]
      );
    }

    return this.rootColorById.get(rootId) ?? DEFAULT_MARKER_COLOR;
  }

  private getRootCategoryId(categoryId: number): number | null {
    let current = this.categoryById.get(categoryId);
    if (!current) return null;

    while (current.id_parent_category !== null) {
      const parent = this.categoryById.get(current.id_parent_category);
      if (!parent) break;
      current = parent;
    }

    return current.id_category;
  }

  private getMarkerLabel(annotation: Annotation): string {
    const place = annotation.neighborhood_name ?? `Barrio ${annotation.id_neighborhood}`;
    return `${place}: ${annotation.description}`;
  }

  private hasValidCoords(annotation: Annotation): boolean {
    return Number.isFinite(annotation.latitude) && Number.isFinite(annotation.longitude);
  }

  private clearActiveMarkers(): void {
    this.markerByAnnotationId.forEach((marker, annotationId) => {
      marker.setStyle({
        radius: 9,
        weight: 2.5,
        fillColor: this.getAnnotationColor(annotationId),
      });
    });
  }
}
