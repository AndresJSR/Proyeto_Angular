import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  Component,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MapaBaseComponent } from '../../components/mapa-base/mapa-base.component';
import { DemarcacionPanelComponent } from '../../components/demarcacion-panel/demarcacion-panel.component';
import { DemarcacionSidebarComponent } from '../../components/demarcacion-sidebar/demarcacion-sidebar.component';
import { Barrio } from '../../../../models/barrio.model';
import { BarriosService } from '../../services/barrios.service';

@Component({
  selector: 'app-mapa-demarcacion-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MapaBaseComponent,
    DemarcacionPanelComponent,
    DemarcacionSidebarComponent,
    TablerIconsModule,
  ],
  templateUrl: './mapa-demarcacion-page.component.html',
  styleUrls: ['./mapa-demarcacion-page.component.scss'],
})
export class MapaDemarcacionPageComponent implements OnDestroy {
  private readonly barriosSvc = inject(BarriosService);
  private readonly snack = inject(MatSnackBar);
  private readonly vertexIcon = L.divIcon({
    className: '',
    html: '<div style="width:20px;height:20px;border-radius:50%;background:#1d4ed8;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  @ViewChild('demarcacionPanel') demarcacionPanel?: DemarcacionPanelComponent;

  barrioActivo = signal<Barrio | null>(null);
  drawCoords = signal<[number, number][]>([]);
  loadedCoords = signal<[number, number][]>([]);
  isSaving = signal(false);

  private map?: L.Map;
  private drawLayer?: L.Polygon;
  private drawMarkers: L.Marker[] = [];

  onMapReady(map: L.Map) {
    this.map = map;

    // Si los puntos llegaron antes de que Leaflet inicializara, renderizar ahora.
    if (this.drawCoords().length) {
      this.redrawPolygon();
      this.fitPolygonBounds();
    }
  }

  onMapClick(event: L.LeafletMouseEvent) {
    if (!this.barrioActivo()) return;

    const coords = [
      ...this.drawCoords(),
      [event.latlng.lat, event.latlng.lng] as [number, number],
    ];
    this.drawCoords.set(coords);
    this.redrawPolygon();
  }

  onBarrioSeleccionado(barrio: Barrio | null) {
    this.barrioActivo.set(barrio);
    this.clearDrawLayers();
    this.drawCoords.set([]);
    this.loadedCoords.set([]);

    if (!barrio) return;

    this.barriosSvc.getPointsByNeighborhood(barrio.id_neighborhood).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.items ?? []);
        if (!items.length) return;

        const sorted = [...items].sort((a: any, b: any) => a.order - b.order);
        const coords = sorted.map((p: any) => [p.latitude, p.longitude] as [number, number]);

        this.drawCoords.set(coords);
        this.loadedCoords.set([...coords]);
        this.redrawPolygon();
        this.fitPolygonBounds();
      },
      error: () => {
        this.drawCoords.set([]);
        this.loadedCoords.set([]);
      },
    });
  }

  savePolygon() {
    if (!this.barrioActivo() || this.drawCoords().length < 3) return;
    this.isSaving.set(true);
    this.demarcacionPanel?.save(this.drawCoords());
  }

  onPolygonSaved(saved: boolean) {
    this.isSaving.set(false);

    if (saved) {
      this.snack.open('Polígono guardado correctamente', '✕', { duration: 3000 });
      this.recargarPoligono();
      return;
    }

    this.snack.open('No se pudo guardar el polígono', '✕', { duration: 3500 });
  }

  clearPolygon() {
    this.drawCoords.set([]);
    this.clearDrawLayers();
  }

  cancelEdit() {
    const restored = [...this.loadedCoords()];
    this.drawCoords.set(restored);
    this.redrawPolygon();
    this.fitPolygonBounds();
  }

  ngOnDestroy() {
    this.clearDrawLayers();
  }

  private recargarPoligono() {
    const barrio = this.barrioActivo();
    if (!barrio) return;

    this.barriosSvc.getPointsByNeighborhood(barrio.id_neighborhood).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.items ?? []);
        const boundary = items
          .filter(
            (p: any) =>
              p.point_type === 'boundary' && p.id_neighborhood === barrio.id_neighborhood
          )
          .sort((a: any, b: any) => a.order - b.order)
          .map((p: any) => [p.latitude, p.longitude] as [number, number]);

        this.drawCoords.set(boundary);
        this.loadedCoords.set([...boundary]);
        this.redrawPolygon();
        this.fitPolygonBounds();
      },
      error: () => {
        this.drawCoords.set([]);
        this.loadedCoords.set([]);
        this.clearDrawLayers();
      },
    });
  }

  private fitPolygonBounds() {
    if (!this.map || !this.drawLayer) return;
    this.map.fitBounds(this.drawLayer.getBounds(), { padding: [40, 40] });
  }

  private redrawPolygon() {
    if (!this.map) return;

    this.clearDrawLayers();

    const coords = this.drawCoords();
    if (!coords.length) return;

    this.drawLayer = L.polygon(coords, {
      color: '#1976d2',
      weight: 2,
    }).addTo(this.map);

    coords.forEach((coord, idx) => {
      const marker = L.marker(coord, { draggable: true, icon: this.vertexIcon })
        .addTo(this.map as L.Map)
        .on('dragstart', () => {
          this.map?.dragging.disable();
        })
        .on('drag', (e: L.LeafletEvent) => {
          const dragEvent = e as L.LeafletMouseEvent;
          const updated = [...this.drawCoords()];
          updated[idx] = [dragEvent.latlng.lat, dragEvent.latlng.lng];
          this.drawCoords.set(updated);

          // Actualiza la geometría en vivo sin recrear todos los marcadores.
          if (this.drawLayer) {
            this.drawLayer.setLatLngs(updated as L.LatLngExpression[]);
          }
        })
        .on('dragend', () => {
          this.map?.dragging.enable();
        })
        .on('contextmenu', () => {
          const updated = this.drawCoords().filter((_, pointIdx) => pointIdx !== idx);
          this.drawCoords.set(updated);
          this.redrawPolygon();
        });

      this.drawMarkers.push(marker);
    });
  }

  private clearDrawLayers() {
    if (!this.map) return;

    if (this.drawLayer) {
      this.map.removeLayer(this.drawLayer);
      this.drawLayer = undefined;
    }

    this.drawMarkers.forEach((marker) => this.map?.removeLayer(marker));
    this.drawMarkers = [];
  }
}
