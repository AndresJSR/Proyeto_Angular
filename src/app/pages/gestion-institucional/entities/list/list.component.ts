import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesAdminService } from '../entities.service';
import { Entity } from '../../../../models/entity.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { environment } from 'src/environments/environment';
import { SkeletonTableComponent } from 'src/app/components/skeleton-table/skeleton-table.component';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, SkeletonTableComponent],
  templateUrl: './list.component.html',
})
export class EntitiesListComponent implements OnInit {
  private svc    = inject(EntitiesAdminService);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);

  entities  = signal<Entity[]>([]);
  loading   = signal(false);
  search    = signal('');
  columns   = ['logo', 'name', 'nit', 'email', 'phone', 'status', 'actions'];

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.entities();
    return this.entities().filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.nit?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.entities.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  logoUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Backend devuelve "/api/images/logos/..." así que concatenamos directamente
    return `${environment.apiUrl}${url}`;
  }

  openDelete(entity: Entity) {
    this.dialog.open(DeleteDialogComponent, { data: entity, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}