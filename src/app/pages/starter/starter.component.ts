import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as L from 'leaflet';

import { MaterialModule } from '../../material.module';
import { BarChartComponent } from '../../components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../../components/charts/pie-chart/pie-chart.component';
import { MapaBaseComponent } from '../mapa-territorial/components/mapa-base/mapa-base.component';

import { CitizensService } from '../gestion-institucional/citizens/citizens.service';
import { OfficialsAdminService } from '../gestion-institucional/officials/officials.service';
import { EntitiesAdminService } from '../gestion-institucional/entities/entities.service';
import { BarriosService } from '../mapa-territorial/services/barrios.service';

import { Citizen } from '../../models/citizen.model';
import { Official } from '../../models/official.model';
import { Entity } from '../../models/entity.model';
import { Annotation } from '../../models/annotation.model';
import { Barrio } from '../../models/barrio.model';
import { BarReportResponse, PieReportResponse } from '../../models/report-response.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [CommonModule, DatePipe, MaterialModule, RouterModule, BarChartComponent, PieChartComponent, MapaBaseComponent],
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  private http           = inject(HttpClient);
  private citizensSvc    = inject(CitizensService);
  private officialsSvc   = inject(OfficialsAdminService);
  private entitiesSvc    = inject(EntitiesAdminService);
  private barriosSvc     = inject(BarriosService);

  loading    = signal(true);
  mapLoading = signal(false);

  citizens    = signal<Citizen[]>([]);
  officials   = signal<Official[]>([]);
  entities    = signal<Entity[]>([]);
  annotations = signal<Annotation[]>([]);
  barrios     = signal<Barrio[]>([]);

  // KPIs
  totalCitizens    = computed(() => this.citizens().length);
  activeOfficials  = computed(() => this.officials().filter(o => o.status === 'active').length);
  totalEntities    = computed(() => this.entities().length);
  totalAnnotations = computed(() => this.annotations().length);

  // Estado activos / inactivos
  activeCitizens    = computed(() => this.citizens().filter(c => c.status === 'active').length);
  inactiveCitizens  = computed(() => this.citizens().filter(c => c.status !== 'active').length);
  inactiveOfficials = computed(() => this.officials().filter(o => o.status !== 'active').length);
  citizenPct        = computed(() => this.totalCitizens() ? Math.round(this.activeCitizens() / this.totalCitizens() * 100) : 0);
  officialPct       = computed(() => (this.activeOfficials() + this.inactiveOfficials()) ? Math.round(this.activeOfficials() / (this.activeOfficials() + this.inactiveOfficials()) * 100) : 0);

  // Últimas 5 anotaciones
  recentAnnotations = computed(() =>
    [...this.annotations()]
      .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
      .slice(0, 5)
  );

  barChart: BarReportResponse | null = null;
  pieChart: PieReportResponse | null = null;

  private map?: L.Map;
  private polygonLayers: L.Polygon[] = [];

  ngOnInit() {
    forkJoin({
      citizens:    this.citizensSvc.getAll().pipe(catchError(() => of([] as Citizen[]))),
      officials:   this.officialsSvc.getAll().pipe(catchError(() => of([] as Official[]))),
      entities:    this.entitiesSvc.getAll().pipe(catchError(() => of([] as Entity[]))),
      annotations: this.http.get<Annotation[]>(`${environment.apiUrl}/api/annotations`).pipe(catchError(() => of([] as Annotation[]))),
      barrios:     this.barriosSvc.getAll().pipe(catchError(() => of([] as Barrio[]))),
    }).subscribe({
      next: data => {
        this.citizens.set(data.citizens);
        this.officials.set(data.officials);
        this.entities.set(data.entities);
        this.annotations.set(data.annotations);
        this.barrios.set(data.barrios);
        this.buildBarChart();
        this.buildPieChart();
        this.loading.set(false);
        if (this.map) this.loadAndDrawHeatMap();
      },
      error: () => this.loading.set(false),
    });
  }

  onMapReady(map: L.Map) {
    this.map = map;
    if (!this.loading()) this.loadAndDrawHeatMap();
  }

  private buildBarChart() {
    const annotations = this.annotations();
    const barrios     = this.barrios();
    if (!annotations.length) return;

    const counts: Record<number, number> = {};
    annotations.forEach(a => {
      counts[a.id_neighborhood] = (counts[a.id_neighborhood] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);

    this.barChart = {
      type: 'bar',
      labels: sorted.map(([id]) => barrios.find(b => b.id_neighborhood === +id)?.name ?? `Barrio ${id}`),
      series: [{ name: 'Anotaciones', data: sorted.map(([, c]) => c as number) }],
    };
  }

  private buildPieChart() {
    const officials = this.officials();
    const entities  = this.entities();
    if (!officials.length || !entities.length) return;

    const counts: Record<number, number> = {};
    officials.forEach(o => {
      counts[o.id_entity] = (counts[o.id_entity] || 0) + 1;
    });

    const entries = Object.entries(counts);
    this.pieChart = {
      type: 'pie',
      labels: entries.map(([id]) => entities.find(e => e.id_entity === +id)?.name ?? `Entidad ${id}`),
      series: entries.map(([, c]) => c as number),
    };
  }

  private loadAndDrawHeatMap() {
    if (!this.map) return;
    this.polygonLayers.forEach(p => p.removeFrom(this.map!));
    this.polygonLayers = [];

    const barrios = this.barrios();
    if (!barrios.length) return;

    this.mapLoading.set(true);
    const requests = barrios.map(b =>
      this.barriosSvc.getPointsByNeighborhood(b.id_neighborhood).pipe(catchError(() => of([])))
    );

    forkJoin(requests).subscribe(results => {
      const annotations = this.annotations();
      const counts: Record<number, number> = {};
      annotations.forEach(a => {
        counts[a.id_neighborhood] = (counts[a.id_neighborhood] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(counts), 1);

      results.forEach((points: any[], i) => {
        if (points.length >= 3) {
          const coords: [number, number][] = points
            .sort((a: any, b: any) => a.order - b.order)
            .map((p: any) => [p.latitude, p.longitude] as [number, number]);

          const barrio  = barrios[i];
          const count   = counts[barrio.id_neighborhood] ?? 0;
          const polygon = L.polygon(coords, {
            color:       count > 0 ? '#1e3a8a' : '#94a3b8',
            fillColor:   this.heatColor(count, maxCount),
            weight:      1,
            fillOpacity: count > 0 ? 0.7 : 0.25,
          })
            .bindTooltip(
              `<strong>${barrio.name}</strong><br/>${count} anotación${count !== 1 ? 'es' : ''}`,
              { sticky: true }
            )
            .addTo(this.map!);

          this.polygonLayers.push(polygon);
        }
      });

      if (this.polygonLayers.length) {
        const group = L.featureGroup(this.polygonLayers);
        this.map!.fitBounds(group.getBounds(), { padding: [16, 16] });
      }

      this.mapLoading.set(false);
    });
  }

  private heatColor(count: number, max: number): string {
    if (count === 0) return '#cbd5e1';  // gris visible para barrios sin datos
    const r = count / max;
    if (r <= 0.20) return '#dbeafe';   // azul muy claro
    if (r <= 0.40) return '#93c5fd';   // azul claro
    if (r <= 0.60) return '#3b82f6';   // azul medio
    if (r <= 0.80) return '#1d4ed8';   // azul fuerte
    return '#1e3a8a';                  // azul muy oscuro (máximo)
  }

  getBarrioName(id: number): string {
    return this.barrios().find(b => b.id_neighborhood === id)?.name ?? `Barrio ${id}`;
  }
}
