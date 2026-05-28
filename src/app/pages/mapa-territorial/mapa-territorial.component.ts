import {
  Component, inject, OnInit, signal,
  AfterViewInit, DestroyRef, viewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { AnnotationsService } from './services/annotations.service';
import { AnnotationCategoriesService } from './services/annotation-categories.service';
import { AnotacionFormComponent } from './components/anotacion-form/anotacion-form.component';
import { FiltrosPanelComponent } from './components/filtros-panel/filtros-panel.component';
import { DemarcacionPanelComponent } from './components/demarcacion-panel/demarcacion-panel.component';
import { TrackingPanelComponent } from './components/tracking-panel/tracking-panel.component';
import { AnotacionDetalleComponent } from './components/anotacion-detalle/anotacion-detalle.component';
import { Annotation } from './models/annotation.model';
import { Barrio } from './models/barrio.model';
import { Official } from './models/official.model';
import { BarriosService } from './services/barrios.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-mapa-territorial',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    AnotacionFormComponent,
    FiltrosPanelComponent,
    DemarcacionPanelComponent,
    TrackingPanelComponent,
    AnotacionDetalleComponent,
  ],
  templateUrl: './mapa-territorial.component.html',
  styleUrl: './mapa-territorial.component.scss'
})
export class MapaTerritorialComponent implements OnInit, AfterViewInit {
  private annSvc = inject(AnnotationsService);
  private barriosSvc = inject(BarriosService);
  private annCatSvc = inject(AnnotationCategoriesService);
  private destroyRef = inject(DestroyRef);
  private snack = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  filtered = this.annSvc.filtered;
  loading = this.annSvc.loading;
  selected = signal<Annotation | null>(null);
  mode = signal<'mapa' | 'demarcacion' | 'tracking'>('mapa');
  demarcacionPanel = viewChild<DemarcacionPanelComponent>('demarcacionPanel');
  barrioActivo = signal<Barrio | null>(null);
  drawCoords = signal<[number, number][]>([]);
  formCoords = signal<[number, number] | null>(null);
  showForm = signal(false);
  isSaving = signal(false);

  private map!: L.Map;
  private clusterGroup!: L.MarkerClusterGroup;
  private readonly COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'
  ];
  private categoryColorMap = new Map<number, string>();
  private filtered$: Observable<Annotation[]>;
  private drawLayer?: L.Polygon;
  private drawMarkers: L.Marker[] = [];
  private officialMarkers = new Map<number, L.Marker>();

  constructor() {
    // toObservable debe crearse en un contexto de inyeccion.
    this.filtered$ = toObservable(this.filtered).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  ngOnInit() {
    this.annSvc.loadAll();
    this.loadCategoryColors();
    this.setModeFromRoute();
  }

  private setModeFromRoute() {
    const mode = this.route.snapshot.data['mode'];
    const currentPath = this.router.url;

    if (mode === 'tracking') {
      this.mode.set('tracking');
      return;
    }

    if (currentPath.includes('/mapa/demarcacion')) {
      this.mode.set('demarcacion');
      return;
    }

    if (currentPath.includes('/mapa/seguimiento') || currentPath.includes('/monitoreo/tiempo-real')) {
      this.mode.set('tracking');
      return;
    }

    this.mode.set('mapa');

    if (currentPath.includes('/mapa/anotar')) {
      this.formCoords.set(null);
      this.showForm.set(true);
    }

    if (currentPath.includes('/mapa/filtros')) {
      this.showForm.set(false);
    }
  }

  ngAfterViewInit() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = L.map('map', { preferCanvas: true }).setView([5.095, -75.514], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      updateWhenIdle: true,
      keepBuffer: 2
    }).addTo(this.map);

    // Forzar recálculo de tamaño después de que el layout termine de renderizar.
    setTimeout(() => this.map.invalidateSize(), 200);

    this.clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 50,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17
    });
    this.map.addLayer(this.clusterGroup);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.mode() === 'mapa') {
        this.formCoords.set([e.latlng.lat, e.latlng.lng]);
        this.showForm.set(true);
      } else if (this.mode() === 'demarcacion' && this.barrioActivo()) {
        const coords = [...this.drawCoords(), [e.latlng.lat, e.latlng.lng] as [number, number]];
        this.drawCoords.set(coords);
        this.redrawPolygon();
      }
    });

    this.map.on('moveend', () => this.annSvc.loadMore());

    this.filtered$.subscribe(annotations => this.renderMarkers(annotations));
  }

  onBarrioSeleccionado(b: Barrio | null) {
    this.barrioActivo.set(b);
    this.drawCoords.set([]);
    this.clearDrawLayers();

    if (!b) {
      return;
    }

    // CU-10 paso 2: cargar puntos existentes
    this.barriosSvc.getPointsByNeighborhood(b.id_neighborhood).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res.items ?? []);
        if (items.length) {
          const sorted = [...items].sort((a: any, b: any) => a.order - b.order);
          this.drawCoords.set(sorted.map((p: any) => [p.latitude, p.longitude] as [number, number]));
          this.redrawPolygon();
          // Centrar mapa en el polígono
          if (this.drawLayer) {
            this.map.fitBounds(this.drawLayer.getBounds(), { padding: [40, 40] });
          }
        }
        this.enableDrawMode();
      },
      error: () => this.enableDrawMode()
    });
  }

  savePolygon() {
    this.isSaving.set(true);
    this.demarcacionPanel()?.save(this.drawCoords());
  }

  onOfficialsUpdate(officials: Official[]) {
    const active = new Set(officials.map(o => o.id_official));

    this.officialMarkers.forEach((marker, id) => {
      if (!active.has(id)) {
        this.map.removeLayer(marker);
        this.officialMarkers.delete(id);
      }
    });

    officials.forEach(o => {
      const latlng: L.LatLngExpression = [o.last_latitude, o.last_longitude];
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${o.gps_active ? '#2ecc71' : '#aaa'};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px #0004"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      if (this.officialMarkers.has(o.id_official)) {
        this.officialMarkers.get(o.id_official)!.setLatLng(latlng);
      } else {
        const m = L.marker(latlng, { icon })
          .bindTooltip(o.name, { permanent: false })
          .addTo(this.map);
        this.officialMarkers.set(o.id_official, m);
      }
    });
  }

  recargarPoligono() {
    this.isSaving.set(false);
    this.snack.open('Polígono guardado correctamente', '✕', { duration: 3000 });
    const b = this.barrioActivo();
    if (!b) return;

    this.barriosSvc.getPointsByNeighborhood(b.id_neighborhood).subscribe({
      next: (res: any[]) => {
        const boundary = res
          .filter(p => p.point_type === 'boundary' && p.id_neighborhood === b.id_neighborhood)
          .sort((a, b) => a.order - b.order);
        this.drawCoords.set(boundary.map(p => [p.latitude, p.longitude] as [number, number]));
        this.redrawPolygon();
        if (this.drawLayer) {
          this.map.fitBounds(this.drawLayer.getBounds(), { padding: [40, 40] });
        }
      }
    });
  }

  setMode(mode: 'mapa' | 'demarcacion' | 'tracking') {
    this.mode.set(mode);

    if (mode !== 'mapa') {
      this.showForm.set(false);
      this.formCoords.set(null);
    }

    if (mode === 'demarcacion') {
      if (this.barrioActivo()) {
        this.enableDrawMode();
      }
      return;
    }

    this.barrioActivo.set(null);
    this.drawCoords.set([]);
    this.clearDrawLayers();

    if (mode !== 'tracking') {
      this.officialMarkers.forEach(m => this.map.removeLayer(m));
      this.officialMarkers.clear();
    }
  }

  private enableDrawMode() {
    if (!this.barrioActivo()) return;
  }

  public clearDrawLayers() {
    if (this.drawLayer) {
      this.map.removeLayer(this.drawLayer);
      this.drawLayer = undefined;
    }
    this.drawMarkers.forEach(marker => this.map.removeLayer(marker));
    this.drawMarkers = [];
  }

  private redrawPolygon() {
    this.clearDrawLayers();

    const coords = this.drawCoords();
    if (!coords.length) return;

    this.drawLayer = L.polygon(coords, { color: '#1976d2', weight: 2 }).addTo(this.map);

    // Marcadores arrastrables (flujo 3a)
    coords.forEach((c, i) => {
      const marker = L.marker(c, { draggable: true })
        .addTo(this.map)
        .on('drag', (e: L.LeafletEvent) => {
          const dragEvent = e as L.LeafletMouseEvent;
          const updated = [...this.drawCoords()];
          updated[i] = [dragEvent.latlng.lat, dragEvent.latlng.lng];
          this.drawCoords.set(updated);
          this.redrawPolygon();
        })
        .on('contextmenu', () => {
          const updated = this.drawCoords().filter((_, idx) => idx !== i);
          this.drawCoords.set(updated);
          this.redrawPolygon();
        });
      this.drawMarkers.push(marker);
    });
  }

  private renderMarkers(annotations: Annotation[]) {
    this.clusterGroup.clearLayers();
    if (!annotations.length) return;

    // Procesar en chunks para no bloquear el hilo principal
    const chunkSize = 100;
    let i = 0;

    const processChunk = () => {
      const end = Math.min(i + chunkSize, annotations.length);
      const batch: L.CircleMarker[] = [];

      for (; i < end; i++) {
        const a = annotations[i];
        const color = this.categoryColorMap.get(a.id_annotation) ?? '#e74c3c';
        const marker = L.circleMarker([a.latitude, a.longitude], {
          radius: 7,
          fillColor: color,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.85
        }).on('click', () => this.selected.set(a));
        batch.push(marker);
      }

      this.clusterGroup.addLayers(batch);

      if (i < annotations.length) {
        requestAnimationFrame(processChunk);
      }
    };

    requestAnimationFrame(processChunk);
  }

  private loadCategoryColors() {
    this.annCatSvc.getAll().subscribe((acs: any[]) => {
      acs.forEach((ac: any) => {
        if (!this.categoryColorMap.has(ac.id_annotation)) {
          const color = this.COLORS[ac.id_category % this.COLORS.length];
          this.categoryColorMap.set(ac.id_annotation, color);
        }
      });
    });
  }
}