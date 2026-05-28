import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { AnotacionFormComponent as NuevaAnotacionFormComponent } from '../components/anotacion-form/anotacion-form.component';
import { AnotarFiltersBarComponent } from './components/anotar-filters-bar/anotar-filters-bar.component';
import { CoordsTooltipComponent } from './components/coords-tooltip/coords-tooltip.component';
import { Annotation } from '../models/annotation.model';
import { Barrio } from '../models/barrio.model';
import { Category } from '../models/category.model';
import { Entity } from '../models/entity.model';
import { AnnotationsService } from '../services/annotations.service';
import { CategoriesService } from '../services/categories.service';
import { EntitiesService } from '../services/entities.service';
import { BarriosService } from '../services/barrios.service';

@Component({
  selector: 'app-mapa-anotar-page',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MapaBaseComponent,
    NuevaAnotacionFormComponent,
    AnotarFiltersBarComponent,
    CoordsTooltipComponent,
  ],
  templateUrl: './mapa-anotar-page.component.html',
  styleUrls: ['./mapa-anotar-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaAnotarPageComponent implements OnInit {
  private readonly annotationsService = inject(AnnotationsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly entitiesService = inject(EntitiesService);
  private readonly barriosService = inject(BarriosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  formCoords = signal<[number, number] | null>(null);
  showForm = signal(false);
  selectedAnnotation = signal<Annotation | null>(null);
  communes = signal<{ id: number; name: string }[]>([]);
  barrios = signal<Barrio[]>([]);

  categories = signal<Category[]>([]);
  entities = signal<Entity[]>([]);
  selectedCommune = signal<number | null>(null);
  selectedBarrio = signal<number | null>(null);
  selectedCategories = signal<Set<number>>(new Set());
  loading = this.annotationsService.loading;

  barriosFiltro = computed(() =>
    this.barrios().map((barrio) => ({
      id: barrio.id_neighborhood,
      name: barrio.name,
      id_commune: this.resolveCommuneId(barrio),
    }))
  );

  private map?: L.Map;
  private readonly markers = new Map<number, L.Marker>();
  private readonly neighborhoodToCommune = new Map<number, number>();

  ngOnInit(): void {
    this.annotationsService.loadAll();

    this.categoriesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories.set(categories));

    this.entitiesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entities) => this.entities.set(entities));

    this.barriosService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((barrios) => {
        this.barrios.set(barrios);

        const communeMap = new Map<number, string>();
        this.neighborhoodToCommune.clear();

        for (const barrio of barrios) {
          const idCommune = this.resolveCommuneId(barrio);
          const communeName = this.resolveCommuneName(barrio);

          if (idCommune !== null) {
            this.neighborhoodToCommune.set(barrio.id_neighborhood, idCommune);
          }

          if (idCommune !== null && communeName) {
            communeMap.set(idCommune, communeName);
          }
        }

        const communes = [...communeMap.entries()]
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.communes.set(communes);
      });
  }

  onMapReady(map: L.Map): void {
    this.map = map;

    toObservable(this.annotationsService.filtered)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((annotations) => this.renderMarkers(annotations));

    this.renderMarkers(this.annotationsService.filtered());
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    this.formCoords.set([e.latlng.lat, e.latlng.lng]);
    this.showForm.set(true);
    this.snackBar.open(
      'Punto seleccionado — Las coordenadas se han cargado en el formulario.',
      'OK',
      { duration: 2800 }
    );
  }

  onFormSaved(_id: number): void {
    this.showForm.set(false);
    this.formCoords.set(null);
    this.annotationsService.loadAll();
    this.renderMarkers(this.annotationsService.filtered());
  }

  onFormClosed(): void {
    this.showForm.set(false);
    this.formCoords.set(null);
  }

  onCommuneChange(value: number | null): void {
    this.selectedCommune.set(value);

    const selectedBarrioId = this.selectedBarrio();
    if (selectedBarrioId !== null) {
      const barrio = this.barriosFiltro().find((item) => item.id === selectedBarrioId);
      if (barrio && value !== null && barrio.id_commune !== value) {
        this.selectedBarrio.set(null);
      }
    }

    this.renderMarkers(this.annotationsService.filtered());
  }

  onBarrioChange(value: number | null): void {
    this.selectedBarrio.set(value);
    this.renderMarkers(this.annotationsService.filtered());
  }

  onCategoryToggle(categoryId: number): void {
    const next = new Set(this.selectedCategories());
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    this.selectedCategories.set(next);
    this.renderMarkers(this.annotationsService.filtered());
  }

  onFiltrosClick(): void {
    this.snackBar.open('Filtros aplicados sobre los marcadores visibles.', 'OK', {
      duration: 2000,
    });
    this.renderMarkers(this.annotationsService.filtered());
  }

  private renderMarkers(annotations: Annotation[]): void {
    if (!this.map) {
      return;
    }

    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers.clear();

    const visible = annotations.filter((annotation) => this.matchesFilters(annotation));

    for (const annotation of visible) {
      const marker = L.marker([annotation.latitude, annotation.longitude], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      })
        .bindPopup(
          `<strong>${annotation.description}</strong><br/>Lat: ${annotation.latitude.toFixed(5)}<br/>Lng: ${annotation.longitude.toFixed(5)}`
        )
        .on('click', () => this.selectedAnnotation.set(annotation))
        .addTo(this.map);

      this.markers.set(annotation.id_annotation, marker);
    }
  }

  private matchesFilters(annotation: Annotation): boolean {
    const communeId = this.selectedCommune();
    const barrioId = this.selectedBarrio();
    const categoryIds = this.selectedCategories();

    if (barrioId !== null && annotation.id_neighborhood !== barrioId) {
      return false;
    }

    if (communeId !== null) {
      const annotationCommune = this.neighborhoodToCommune.get(annotation.id_neighborhood);
      if (annotationCommune !== communeId) {
        return false;
      }
    }

    if (categoryIds.size) {
      const raw = annotation as Annotation & {
        category_ids?: number[];
        id_category?: number;
      };

      if (Array.isArray(raw.category_ids)) {
        const hasSelected = raw.category_ids.some((id) => categoryIds.has(id));
        if (!hasSelected) {
          return false;
        }
      } else if (typeof raw.id_category === 'number' && !categoryIds.has(raw.id_category)) {
        return false;
      }
    }

    return true;
  }

  private resolveCommuneId(barrio: Barrio): number {
    const raw = barrio as Barrio & {
      id_commune?: number | null;
      id_municipality?: number | null;
    };

    const id = raw.id_commune ?? raw.id_municipality ?? 0;
    return Number.isFinite(id) ? Number(id) : 0;
  }

  private resolveCommuneName(barrio: Barrio): string {
    const raw = barrio as Barrio & {
      commune_name?: string | null;
      municipality_name?: string | null;
      commune?: string | null;
    };

    return String(raw.commune_name ?? raw.municipality_name ?? raw.commune ?? '').trim();
  }
}
