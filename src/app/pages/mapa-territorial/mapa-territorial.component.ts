import {
  Component, inject, OnInit, signal,
  AfterViewInit, effect, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

import { AnnotationsService } from './services/annotations.service';
import { FiltrosPanelComponent } from './components/filtros-panel/filtros-panel.component';
import { AnotacionDetalleComponent } from './components/anotacion-detalle/anotacion-detalle.component';
import { Annotation } from './models/annotation.model';

@Component({
  selector: 'app-mapa-territorial',
  standalone: true,
  imports: [CommonModule, FiltrosPanelComponent, AnotacionDetalleComponent],
  templateUrl: './mapa-territorial.component.html',
  styleUrl: './mapa-territorial.component.scss'
})
export class MapaTerritorialComponent implements OnInit, AfterViewInit {
  private annSvc = inject(AnnotationsService);

  filtered = this.annSvc.filtered;
  selected = signal<Annotation | null>(null);

  private map!: L.Map;
  private markers: L.CircleMarker[] = [];

  ngOnInit() {
    this.annSvc.loadAll();
  }

  ngAfterViewInit() {
    // Fix: decirle a Leaflet dónde están sus imágenes en Angular
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = L.map('map').setView([5.095, -75.514], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    effect(() => {
      this.renderMarkers(this.filtered());
    });
  }

  private renderMarkers(annotations: Annotation[]) {
    // Limpiar marcadores anteriores
    this.markers.forEach(m => m.remove());
    this.markers = [];

    if (!annotations.length) return;

    // CU-14 paso 2: marcador por anotación
    annotations.forEach(a => {
      const marker = L.circleMarker([a.latitude, a.longitude], {
        radius: 8,
        fillColor: '#e74c3c',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.85
      })
        .addTo(this.map)
        // CU-14 paso 9-10: clic en marcador abre detalle
        .on('click', () => this.selected.set(a));

      this.markers.push(marker);
    });
  }
}