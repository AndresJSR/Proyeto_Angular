import {
  Component, inject, OnInit, signal,
  AfterViewInit, viewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { DemarcacionPanelComponent } from './components/demarcacion-panel/demarcacion-panel.component';
import { Barrio } from '../../models/barrio.model';
import { BarriosService } from './services/barrios.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-mapa-territorial',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    DemarcacionPanelComponent,
  ],
  templateUrl: './mapa-territorial.component.html',
  styleUrl: './mapa-territorial.component.scss'
})
export class MapaTerritorialComponent implements OnInit, AfterViewInit {
  private barriosSvc = inject(BarriosService);
  private snack = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mode = signal<'demarcacion'>('demarcacion');
  demarcacionPanel = viewChild<DemarcacionPanelComponent>('demarcacionPanel');
  barrioActivo = signal<Barrio | null>(null);
  drawCoords = signal<[number, number][]>([]);
  isSaving = signal(false);

  private map!: L.Map;
  private drawLayer?: L.Polygon;
  private drawMarkers: L.Marker[] = [];

  ngOnInit() {
    this.setModeFromRoute();
  }

  private setModeFromRoute() {
    const currentPath = this.router.url;

    if (currentPath.includes('/mapa/demarcacion')) {
      this.mode.set('demarcacion');
      return;
    }

    this.mode.set('demarcacion');
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

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.barrioActivo()) {
        const coords = [...this.drawCoords(), [e.latlng.lat, e.latlng.lng] as [number, number]];
        this.drawCoords.set(coords);
        this.redrawPolygon();
      }
    });
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

}