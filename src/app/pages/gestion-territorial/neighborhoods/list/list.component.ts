import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environment';
import { Commune } from '../../../../models/commune.model';
import { CommunesService } from '../../communes/communes.service';
import { DeleteNeighborhoodDialogComponent } from '../delete-dialog/delete-dialog.component';
import { NeighborhoodsFormComponent } from '../form/form.component';
import { NeighborhoodsService } from '../neighborhoods.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-neighborhoods-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, NeighborhoodsFormComponent],
  templateUrl: './list.component.html',
})
export class NeighborhoodsListComponent implements OnInit, OnDestroy {
  private svc        = inject(NeighborhoodsService);
  private communeSvc = inject(CommunesService);
  private http       = inject(HttpClient);
  private dialog     = inject(MatDialog);

  neighborhoods = signal<any[]>([]);
  communes      = signal<Commune[]>([]);
  loading       = signal(false);
  columns       = ['barrio', 'comuna', 'puntos', 'anotaciones', 'status', 'actions'];
  filterCommune = signal<number | null>(null);
  searchText    = signal('');
  selectedNeighborhood = signal<any | null>(null);

  pointsMap      = signal<Map<number, number>>(new Map());
  annotationsMap = signal<Map<number, number>>(new Map());

  private refreshInterval: any;

  filtered = computed(() => {
    let data = this.neighborhoods();
    if (this.filterCommune()) data = data.filter(n => n.id_commune === this.filterCommune());
    const q = this.searchText().toLowerCase();
    if (q) data = data.filter(n => n.name?.toLowerCase().includes(q));
    return data;
  });

  ngOnInit() {
    this.communeSvc.getAll().subscribe(c => {
      this.communes.set(c);
      this.load();
    });
    this.loadPoints();
    this.loadAnnotations();

    // 🔄 Auto-refresh de conteos cada 3 segundos
    this.refreshInterval = setInterval(() => {
      this.loadPoints();
      this.loadAnnotations();
    }, 3000);
  }

  ngOnDestroy() {
    // Limpiar intervalo al destruir el componente
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => {
        const enriched = d.map(n => ({
          ...n,
          communeName: this.communes().find(c => c.id_commune === n.id_commune)?.name ?? '—'
        }));
        this.neighborhoods.set(enriched);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadPoints() {
    this.http.get<any[]>(`${environment.apiUrl}/api/points`).subscribe({
      next: points => {
        const map = new Map<number, number>();
        points
          .filter(p => p.id_neighborhood !== null && p.point_type === 'boundary')
          .forEach(p => {
            map.set(p.id_neighborhood, (map.get(p.id_neighborhood) ?? 0) + 1);
          });
        this.pointsMap.set(map);
        console.log('%c📍 Conteos actualizados (Geometrías):', 'color: blue; font-weight: bold;', Object.fromEntries(map));
      },
      error: (e) => console.error('Error cargando puntos:', e)
    });
  }

  private loadAnnotations() {
    this.http.get<any[]>(`${environment.apiUrl}/api/annotations`).subscribe({
      next: annotations => {
        const map = new Map<number, number>();
        annotations
          .filter(a => a.id_neighborhood !== null)
          .forEach(a => {
            map.set(a.id_neighborhood, (map.get(a.id_neighborhood) ?? 0) + 1);
          });
        this.annotationsMap.set(map);
        console.log('%c📝 Conteos actualizados (Anotaciones):', 'color: green; font-weight: bold;', Object.fromEntries(map));
      },
      error: (e) => console.error('Error cargando anotaciones:', e)
    });
  }

  pointsCount(id_neighborhood: number): number {
    return this.pointsMap().get(id_neighborhood) ?? 0;
  }

  annotationsCount(id_neighborhood: number): number {
    return this.annotationsMap().get(id_neighborhood) ?? 0;
  }

  onCommuneChange(id: number | null) {
    this.filterCommune.set(id);
  }

  communesForFilter = computed(() => {
    const communeIds = new Set(this.neighborhoods().map(n => n.id_commune));
    return this.communes().filter(c => communeIds.has(c.id_commune));
  });

  selectNeighborhood(n: any) {
    this.selectedNeighborhood.set(n);
  }

  newNeighborhood() {
    this.selectedNeighborhood.set({ id_neighborhood: null, id_commune: null, name: '', status: 'active' });
  }

  clearSelection() {
    this.selectedNeighborhood.set(null);
  }

  openDelete(n: any) {
    const points      = this.pointsCount(n.id_neighborhood);
    const annotations = this.annotationsCount(n.id_neighborhood);
    this.dialog.open(DeleteNeighborhoodDialogComponent, {
      data: { neighborhood: n, points, annotations },
      width: '400px'
    }).afterClosed().subscribe(ok => { if (ok) { this.load(); this.clearSelection(); } });
  }

  onFormSaved() {
    this.load();
    this.clearSelection();
  }
}
