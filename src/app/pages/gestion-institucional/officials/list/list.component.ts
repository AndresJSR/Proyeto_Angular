import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { OfficialsAdminService } from '../officials.service';
import { EntitiesAdminService } from '../../entities/entities.service';
import { Official } from '../../../../models/official.model';
import { Entity } from '../../../../models/entity.model';
import { DeleteOfficialDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-officials-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class OfficialsListComponent implements OnInit {
  private svc       = inject(OfficialsAdminService);
  private entSvc    = inject(EntitiesAdminService);
  private dialog    = inject(MatDialog);
  private route     = inject(ActivatedRoute);

  officials    = signal<Official[]>([]);
  entities     = signal<Entity[]>([]);
  loading      = signal(false);
  entityFilter = signal<number | null>(null);
  search       = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  columns      = ['name', 'email', 'phone', 'role', 'status', 'gps', 'actions'];

  filtered = computed(() => {
    const entity = this.entityFilter();
    const q      = this.search().toLowerCase().trim();
    const status = this.statusFilter();

    return this.officials().filter(o => {
      if (entity && o.id_entity !== entity) return false;
      if (status !== 'all' && o.status !== status) return false;
      if (q && !o.name?.toLowerCase().includes(q) &&
               !o.email?.toLowerCase().includes(q) &&
               !o.role?.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  entityName = computed(() => {
    const f = this.entityFilter();
    if (!f) return null;
    return this.entities().find(e => e.id_entity === f)?.name ?? null;
  });

  ngOnInit() {
    this.entSvc.getAll().subscribe(e => this.entities.set(e));
    const idEntity = this.route.snapshot.queryParamMap.get('id_entity');
    if (idEntity) this.entityFilter.set(+idEntity);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.officials.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDelete(o: Official) {
    this.dialog.open(DeleteOfficialDialogComponent, { data: o, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}
