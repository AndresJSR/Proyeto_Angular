import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environment';
import { CategoriesAdminService } from '../categories.service';
import { Category } from '../category.model';
import { DeleteCategoryDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class CategoriesListComponent implements OnInit {
  private svc    = inject(CategoriesAdminService);
  private dialog = inject(MatDialog);

  all     = signal<Category[]>([]);
  loading = signal(false);
  expanded = signal<Set<number>>(new Set());
  searchText = signal('');

  roots = computed(() => this.all().filter(c => c.id_parent_category === null));

  // Datos de tabla con estructura jerárquica aplanada y filtrados por búsqueda
  displayedData = computed(() => {
    const data: (Category & { isChild?: boolean })[] = [];
    const roots = this.roots();
    const search = this.searchText().toLowerCase();
    
    roots.forEach(root => {
      const rootMatches = !search || root.name.toLowerCase().includes(search);
      const subs = this.subsOf(root.id_category);
      const subsMatches = subs.some(s => s.name.toLowerCase().includes(search));
      
      // Mostrar categoría raíz si coincide o si tiene subcategorías que coinciden
      if (rootMatches || subsMatches) {
        data.push(root);
        if (this.expanded().has(root.id_category)) {
          subs.forEach(sub => {
            if (!search || sub.name.toLowerCase().includes(search)) {
              data.push({ ...sub, isChild: true });
            }
          });
        }
      }
    });
    
    return data;
  });

  columns = ['name', 'type', 'parent', 'status', 'actions'];

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

  hasSubcategories(id: number): boolean {
    return this.subsOf(id).length > 0;
  }

  parentName(id: number | null) {
    if (!id) return '—';
    return this.all().find(c => c.id_category === id)?.name ?? '—';
  }

  getCategoryType(category: Category): string {
    return category.id_parent_category === null ? 'Categoría' : 'Subcategoría';
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
