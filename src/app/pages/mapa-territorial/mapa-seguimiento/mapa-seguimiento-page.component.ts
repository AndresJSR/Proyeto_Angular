import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { take } from 'rxjs';
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
      this.startPolling();
    }
  }

  startPolling() {
    this.officialsSvc
      .startPolling(15_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
  }
}
