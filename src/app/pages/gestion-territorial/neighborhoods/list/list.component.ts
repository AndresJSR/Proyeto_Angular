import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { Commune } from '../../communes/commune.model';
import { CommunesService } from '../../communes/communes.service';
import { DeleteNeighborhoodDialogComponent } from '../delete-dialog/delete-dialog.component';
import { NeighborhoodsFormComponent } from '../form/form.component';
import { NeighborhoodsService } from '../neighborhoods.service';

@Component({
  selector: 'app-neighborhoods-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, NeighborhoodsFormComponent],
  templateUrl: './list.component.html',
})
export class NeighborhoodsListComponent implements OnInit {
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
      // Después de cargar comunas, cargar barrios
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => {
        // Enriquecer los datos con nombres de comunas
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

  onCommuneChange(id: number | null) {
    this.filterCommune.set(id);
  }

  communesForFilter = computed(() => {
    const communeIds = new Set(this.neighborhoods().map(n => n.id_commune));
    return this.communes().filter(c => communeIds.has(c.id_commune));
  });

  pointsCount(id_neighborhood: number) {
    return this.neighborhoods().find(n => n.id_neighborhood === id_neighborhood)?.points_count ?? 0;
  }

  annotationsCount(id_neighborhood: number) {
    return this.neighborhoods().find(n => n.id_neighborhood === id_neighborhood)?.annotations_count ?? 0;
  }

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
    this.dialog.open(DeleteNeighborhoodDialogComponent, { data: n, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) { this.load(); this.clearSelection(); } });
  }

  onFormSaved() {
    this.load();
    this.clearSelection();
  }
}