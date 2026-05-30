import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { take, switchMap } from 'rxjs';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { SeguimientoStatsBarComponent } from './components/seguimiento-stats-bar/seguimiento-stats-bar.component';
import { TrackingPanelComponent } from '../components/tracking-panel/tracking-panel.component';
import { Official } from '../models/official.model';
import { OfficialsService } from '../services/officials.service';
import { OfficialMarkersService } from '../services/official-markers.service';

@Component({
  selector: 'app-mapa-seguimiento-page',
  standalone: true,
  imports: [CommonModule, MapaBaseComponent, TrackingPanelComponent, SeguimientoStatsBarComponent],
  templateUrl: './mapa-seguimiento-page.component.html',
  styleUrls: ['./mapa-seguimiento-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaSeguimientoPageComponent implements OnDestroy {
  private readonly officialsSvc = inject(OfficialsService);
  private readonly markersSvc = inject(OfficialMarkersService);
  private readonly destroyRef = inject(DestroyRef);

  officials = signal<Official[]>([]);
  selectedOfficial = signal<Official | null>(null);
  lastUpdate = signal<string | null>(null);

  activos = computed(() => this.officials().filter((official) => official.gps_active).length);
  sinConexion = computed(() => this.officials().filter((official) => !official.gps_active).length);
  total = computed(() => this.officials().length);

  private map?: L.Map;
  private pollingStarted = false;

  onMapReady(map: L.Map) {
    this.map = map;
    if (!this.pollingStarted) {
      this.pollingStarted = true;
      this.initializeTracking();
    }
  }

  /**
   * Inicializa el seguimiento en tiempo real vía Socket.IO
   * 1. Obtiene la lista de officials (GET /api/officials)
   * 2. Extrae sus IDs
   * 3. Inicia el rastreo (POST /api/officials/tracking/start)
   * 4. Se suscribe a eventos oficial_tracking del Socket.IO
   */
  initializeTracking() {
    this.officialsSvc
      .getOfficials()
      .pipe(
        switchMap((officials) => {
          console.log('[MapaSeguimiento] Officials loaded:', officials);
          this.officials.set(officials);
          this.updateLastUpdate();

          // Inicializar cache de officials en el servicio
          this.officialsSvc.initializeCache(officials);

          // Extraer IDs de officials que cumplen requisitos (gps_active + status active)
          const trackableIds = officials
            .filter((o) => o.gps_active && (o.status === 'active' || o.status === 'activo'))
            .map((o) => o.id_official);

          if (trackableIds.length === 0) {
            console.warn('[MapaSeguimiento] No trackable officials found');
          } else {
            console.log('[MapaSeguimiento] Starting tracking for IDs:', trackableIds);
          }

          // Iniciar rastreo via POST /api/officials/tracking/start
          return this.officialsSvc.startTracking(trackableIds);
        }),
        switchMap(() => {
          // Conectar a Socket.IO después de iniciar rastreo
          console.log('[MapaSeguimiento] Connected to Socket.IO for real-time tracking');
          return this.officialsSvc.connectSocketIO();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          console.debug('[MapaSeguimiento] official_tracking event:', data);
          this.officials.set(data);
          this.updateLastUpdate();

          if (this.map) {
            this.markersSvc.syncMarkers(this.map, data);
          }
        },
        error: (err) => console.error('[MapaSeguimiento] Tracking error:', err),
        complete: () => console.warn('[MapaSeguimiento] Tracking completed'),
      });
  }

  private updateLastUpdate() {
    this.lastUpdate.set(new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date()));
  }

  startPolling() {
    // Mantener para compatibilidad, pero preferir initializeTracking
    this.initializeTracking();
  }

  onOfficialsUpdate(officials: Official[]) {
    if (!this.map) return;
    this.markersSvc.syncMarkers(this.map, officials);
  }

  onOfficialSelected(official: Official) {
    this.selectedOfficial.set(official);
    if (this.map) {
      this.markersSvc.focusOfficial(this.map, official);
    }
  }

  onRefresh() {
    this.officialsSvc
      .startPolling(0)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.officials.set(data);
        this.lastUpdate.set(new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()));

        if (this.map) {
          this.markersSvc.syncMarkers(this.map, data);
        }
      });
  }

  ngOnDestroy() {
    if (this.map) {
      this.markersSvc.clearAll(this.map);
    }
    // Detener rastreo al destruir el componente (opcional)
    this.officialsSvc.stopTracking().subscribe({
      next: () => console.log('[MapaSeguimiento] Tracking stopped'),
      error: (err) => console.warn('[MapaSeguimiento] Error stopping tracking:', err),
    });
  }
}
