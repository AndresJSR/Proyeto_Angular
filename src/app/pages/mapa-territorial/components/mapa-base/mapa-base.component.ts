import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MAPA_BASE_LAYERS } from './mapa-base-layers';
import { MapaBaseLayer } from '../../../../models/mapa-base-layer.model';

@Component({
  selector: 'app-mapa-base',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-base.component.html',
  styleUrls: ['./mapa-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaBaseComponent implements AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapContainer = viewChild<ElementRef<HTMLElement>>('mapContainer');

  readonly center = input<L.LatLngExpression>([5.095, -75.514]);
  readonly initialZoom = input(13);
  readonly showLocateControl = input(true);
  readonly layers = input<MapaBaseLayer[]>(MAPA_BASE_LAYERS);

  readonly mapReady = output<L.Map>();
  readonly mapClick = output<L.LeafletMouseEvent>();
  readonly mapMoveEnd = output<L.LeafletEvent>();

  readonly activeLayer = signal<MapaBaseLayer>(MAPA_BASE_LAYERS[0]);
  readonly layerPanelOpen = signal(false);
  readonly zoomLevel = signal(13);
  readonly locating = signal(false);
  readonly isFullscreen = signal(false);
  readonly coords = signal({ lat: '—', lng: '—' });

  readonly zoomPercent = computed(() => {
    const max = 20;
    return Math.round((this.zoomLevel() / max) * 100);
  });

  private map?: L.Map;
  private currentTileLayer?: L.TileLayer;
  private locationMarker?: L.CircleMarker;
  private locationCircle?: L.Circle;

  ngAfterViewInit() {
    const mapHost = this.mapContainer()?.nativeElement;
    if (!mapHost) return;

    const availableLayers = this.layers();
    const defaultLayer = availableLayers[0] ?? MAPA_BASE_LAYERS[0];
    this.activeLayer.set(defaultLayer);

    this.map = L.map(mapHost, {
      center: this.center(),
      zoom: this.initialZoom(),
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    this.zoomLevel.set(this.map.getZoom());

    this.currentTileLayer = this.activeLayer().build();
    this.currentTileLayer.addTo(this.map);

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(this.map);

    this.map.on('zoomend', () => {
      if (!this.map) return;
      this.zoomLevel.set(this.map.getZoom());
    });

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
      this.mapClick.emit(e);
    });

    this.map.on('moveend', (e: L.LeafletEvent) => this.mapMoveEnd.emit(e));

    document.addEventListener('fullscreenchange', this.onFullscreenChange);

    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = undefined;
    });

    setTimeout(() => this.invalidateSize(), 150);
    this.mapReady.emit(this.map);
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.invalidateSize();
  }

  setLayer(layer: MapaBaseLayer) {
    if (!this.map) return;

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

  closeLayerPanel() {
    this.layerPanelOpen.set(false);
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  locateMe() {
    if (!this.map || this.locating()) return;
    this.locating.set(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!this.map) {
          this.locating.set(false);
          return;
        }

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
        }).bindPopup('Tu ubicación actual').addTo(this.map).openPopup();

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
    setTimeout(() => this.invalidateSize(), 200);
  };

  private invalidateSize() {
    this.map?.invalidateSize();
  }
}
