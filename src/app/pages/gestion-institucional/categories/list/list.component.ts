import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesAdminService } from '../categories.service';
import { Category } from '../category.model';
import { DeleteCategoryDialogComponent } from '../delete-dialog/delete-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class CategoriesListComponent implements OnInit {
  private svc    = inject(CategoriesAdminService);
  private dialog = inject(MatDialog);

  all     = signal<Category[]>([]);
  loading = signal(false);
  expanded = signal<Set<number>>(new Set());

  roots = computed(() => this.all().filter(c => c.id_parent_category === null));

  columns = ['image', 'name', 'type', 'description', 'status', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  subsOf(parentId: number): Category[] {
    return this.all().filter(c => c.id_parent_category === parentId);
  }

  toggleExpand(id: number) {
    const s = new Set(this.expanded());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expanded.set(s);
  }

  parentName(id: number | null) {
    if (!id) return '—';
    return this.all().find(c => c.id_category === id)?.name ?? '—';
  }

  imageUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.includes('/api/images/')) {
      const path = url.startsWith('/') ? url.substring(1) : url;
      return `${environment.apiUrl}/${path}`;
    }
    const normalized = url.replace(/^\.?\/+/, '');
    return `${environment.apiUrl}/api/images/${normalized}`;
  }

  openDelete(c: Category) {
    this.dialog.open(DeleteCategoryDialogComponent, { data: c, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}
