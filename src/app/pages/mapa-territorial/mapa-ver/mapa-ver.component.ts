import {
  Component, OnInit, AfterViewInit, OnDestroy,
  signal, computed, inject, DestroyRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MAP_LAYERS, MapLayer } from './mapa-ver-layers';

@Component({
  selector: 'app-mapa-ver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-ver.component.html',
  styleUrl: './mapa-ver.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaVerComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  private map!: L.Map;
  private currentTileLayer!: L.TileLayer;
  private locationMarker?: L.CircleMarker;
  private locationCircle?: L.Circle;

  readonly layers = MAP_LAYERS;

  readonly activeLayer   = signal<MapLayer>(MAP_LAYERS[0]);
  readonly layerPanelOpen = signal(false);
  readonly zoomLevel     = signal(13);
  readonly locating      = signal(false);
  readonly isFullscreen  = signal(false);
  readonly coords        = signal({ lat: '—', lng: '—' });

  readonly zoomPercent = computed(() => {
    const max = 20;
    return Math.round((this.zoomLevel() / max) * 100);
  });

  ngOnInit() {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngAfterViewInit() {
    this.initMap();
    this.destroyRef.onDestroy(() => this.map?.remove());
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private initMap() {
    this.map = L.map('map-ver', {
      center: [5.095, -75.514],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    this.currentTileLayer = this.activeLayer().build();
    this.currentTileLayer.addTo(this.map);

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(this.map);

    this.map.on('zoomend', () => this.zoomLevel.set(this.map.getZoom()));
    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      this.coords.set({
        lat: e.latlng.lat.toFixed(5),
        lng: e.latlng.lng.toFixed(5),
      });
    });
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.coords.set({
        lat: e.latlng.lat.toFixed(5),
        lng: e.latlng.lng.toFixed(5),
      });
    });

    setTimeout(() => this.map.invalidateSize(), 150);
  }

  setLayer(layer: MapLayer) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = layer.build();
    this.currentTileLayer.addTo(this.map);
    this.activeLayer.set(layer);
    this.layerPanelOpen.set(false);
  }

  toggleLayerPanel() {
    this.layerPanelOpen.update(v => !v);
  }

  zoomIn() {
    this.map.zoomIn();
  }

  zoomOut() {
    this.map.zoomOut();
  }

  locateMe() {
    if (this.locating()) return;
    this.locating.set(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;

        if (this.locationMarker) this.map.removeLayer(this.locationMarker);
        if (this.locationCircle) this.map.removeLayer(this.locationCircle);

        this.locationCircle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#4f46e5',
          fillColor: '#818cf8',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(this.map);

        this.locationMarker = L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: '#4f46e5',
          color: '#fff',
          weight: 3,
          fillOpacity: 1,
        }).bindPopup('📍 Tu ubicación actual').addTo(this.map).openPopup();

        this.map.flyTo([lat, lng], 16, { duration: 1.5 });
        this.locating.set(false);
      },
      () => {
        this.locating.set(false);
        alert('No se pudo obtener la ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private readonly onFullscreenChange = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
    setTimeout(() => this.map?.invalidateSize(), 200);
  };

  closeLayerPanel() {
    this.layerPanelOpen.set(false);
  }
}