import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommunesService } from '../communes.service';
import { Commune } from '../commune.model';
import { DeleteCommuneDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-communes-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, ReactiveFormsModule],
  templateUrl: './list.component.html',
})
export class CommunesListComponent implements OnInit {
  private svc    = inject(CommunesService);
  private dialog = inject(MatDialog);
  private http   = inject(HttpClient);
  private fb     = inject(FormBuilder);

  all          = signal<any[]>([]);
  departments  = signal<any[]>([]);
  cities       = signal<any[]>([]);
  neighborhoods = signal<any[]>([]);
  loading      = signal(false);
  searchText   = signal('');
  filterDept   = signal<number | null>(null);
  filterCity   = signal<number | null>(null);

  columns = ['avatar', 'name', 'city', 'department', 'barrios', 'status', 'actions'];

  filtered = computed(() => {
    let data = this.all();
    if (this.filterDept()) data = data.filter(c => c.id_department === this.filterDept());
    if (this.filterCity()) data = data.filter(c => c.id_city === this.filterCity());
    const q = this.searchText().toLowerCase();
    if (q) data = data.filter(c => c.name?.toLowerCase().includes(q));
    return data;
  });

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/departments`).subscribe(d => this.departments.set(d));
    this.http.get<any[]>(`${environment.apiUrl}/api/cities`).subscribe(c => this.cities.set(c));
    this.http.get<any[]>(`${environment.apiUrl}/api/neighborhoods`).subscribe(n => this.neighborhoods.set(n));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cityName(id_city: number) {
    return this.cities().find(c => c.id_city === id_city)?.name ?? '—';
  }

  deptName(id_city: number) {
    const city = this.cities().find(c => c.id_city === id_city);
    if (!city) return '—';
    return this.departments().find(d => d.id_department === city.id_department)?.name ?? '—';
  }

  barriosCount(id_commune: number) {
    return this.neighborhoods().filter(n => n.id_commune === id_commune).length;
  }

  cityInitial(id_city: number) {
    return this.cityName(id_city)?.charAt(0)?.toUpperCase() ?? '?';
  }

  citiesForDept = computed(() => {
    const d = this.filterDept();
    if (!d) return this.cities();
    return this.cities().filter(c => c.id_department === d);
  });

  onDeptChange(id: number | null) {
    this.filterDept.set(id);
    this.filterCity.set(null);
  }

  openDelete(c: any) {
    const barrios = this.neighborhoods().filter(n => n.id_commune === c.id_commune);
    this.dialog.open(DeleteCommuneDialogComponent, {
      data: { commune: c, barrios },
      width: '450px'
    }).afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}
