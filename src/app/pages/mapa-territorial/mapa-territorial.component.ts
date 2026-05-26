import {
  Component, inject, OnInit, signal,
  AfterViewInit, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { AnnotationsService } from './services/annotations.service';
import { FiltrosPanelComponent } from './components/filtros-panel/filtros-panel.component';
import { AnotacionDetalleComponent } from './components/anotacion-detalle/anotacion-detalle.component';
import { Annotation } from './models/annotation.model';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mapa-territorial',
  standalone: true,
  imports: [CommonModule, FiltrosPanelComponent, AnotacionDetalleComponent],
  templateUrl: './mapa-territorial.component.html',
  styleUrl: './mapa-territorial.component.scss'
})
export class MapaTerritorialComponent implements OnInit, AfterViewInit {
  private annSvc = inject(AnnotationsService);
  private destroyRef = inject(DestroyRef);

  filtered = this.annSvc.filtered;
  loading = this.annSvc.loading;
  selected = signal<Annotation | null>(null);

  private map!: L.Map;
  private clusterGroup!: L.MarkerClusterGroup;
  private filtered$: Observable<Annotation[]>;

  constructor() {
    // toObservable debe crearse en un contexto de inyeccion.
    this.filtered$ = toObservable(this.filtered).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  ngOnInit() {
    this.annSvc.loadAll();
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

    this.map.on('moveend', () => this.annSvc.loadMore());

    this.filtered$.subscribe(annotations => this.renderMarkers(annotations));
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
        const marker = L.circleMarker([a.latitude, a.longitude], {
          radius: 7,
          fillColor: '#e74c3c',
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
}