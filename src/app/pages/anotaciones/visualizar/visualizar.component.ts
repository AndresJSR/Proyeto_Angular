import { Component, inject, signal, AfterViewInit, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { AnnotationsService } from '../../mapa-territorial/services/annotations.service';
import { AnotacionDetalleComponent } from '../../mapa-territorial/components/anotacion-detalle/anotacion-detalle.component';
import { Annotation } from '../../mapa-territorial/models/annotation.model';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-visualizar',
  standalone: true,
  imports: [CommonModule, MaterialModule, AnotacionDetalleComponent],
  templateUrl: './visualizar.component.html',
  styleUrl: './visualizar.component.scss'
})
export class VisualizarComponent implements OnInit, AfterViewInit {
  private annSvc = inject(AnnotationsService);
  private destroyRef = inject(DestroyRef);

  filtered = this.annSvc.filtered;
  loading = this.annSvc.loading;
  selected = signal<Annotation | null>(null);

  private map!: L.Map;
  private clusterGroup!: L.MarkerClusterGroup;

  constructor() {
    toObservable(this.filtered)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(anns => this.renderMarkers(anns));
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

    this.map = L.map('map-visualizar').setView([5.095, -75.514], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17
    });
    this.map.addLayer(this.clusterGroup);

    setTimeout(() => this.map.invalidateSize(), 300);
  }

  private renderMarkers(annotations: Annotation[]) {
    if (!this.clusterGroup) return;
    this.clusterGroup.clearLayers();
    if (!annotations.length) return;

    const batch: L.CircleMarker[] = annotations.map(a =>
      L.circleMarker([a.latitude, a.longitude], {
        radius: 7,
        fillColor: '#e74c3c',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.85
      }).on('click', () => this.selected.set(a))
    );
    this.clusterGroup.addLayers(batch);
  }
}