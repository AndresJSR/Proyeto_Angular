import { Component, inject, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../services/categories.service';
import { AnnotationCategoriesService } from '../../services/annotation-categories.service';
import { AnnotationsService } from '../../services/annotations.service';
import { Category } from '../../../../models/category.model';
import { AnnotationCategory } from '../../../../models/annotation-category.model';

@Component({
  selector: 'app-filtros-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filtros-panel.component.html',
  styleUrl: './filtros-panel.component.scss'
})
export class FiltrosPanelComponent implements OnInit {
  private catSvc = inject(CategoriesService);
  private annCatSvc = inject(AnnotationCategoriesService);
  private annSvc = inject(AnnotationsService);

  tree: Category[] = [];
  allAnnotationCategories: AnnotationCategory[] = [];
  expanded = new Set<number>();
  selectedCategories = new Set<number>();

  ngOnInit() {
    // Cargar árbol de categorías
    this.catSvc.getTree().subscribe(t => this.tree = t);
    // Cargar relaciones anotación-categoría
    this.annCatSvc.getAll().subscribe(ac => this.allAnnotationCategories = ac);
  }

  toggleExpand(id: number) {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }

  // CU-14 paso 5-8: selección de categoría o subcategoría
  toggleCategory(cat: Category) {
    if (this.selectedCategories.has(cat.id_category)) {
      this.selectedCategories.delete(cat.id_category);
      // Eliminar también hijos si estaban seleccionados
      cat.children?.forEach(c => this.selectedCategories.delete(c.id_category));
    } else {
      this.selectedCategories.add(cat.id_category);
      // CU-14 flujo 8a: si selecciona padre, incluir hijos
      cat.children?.forEach(c => this.selectedCategories.add(c.id_category));
    }
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategories.size === 0) {
      this.annSvc.applyFilter(null);
      return;
    }
    const ids = this.annCatSvc.resolveAnnotationIds(
      this.allAnnotationCategories,
      [...this.selectedCategories]
    );
    this.annSvc.applyFilter(ids);
  }

  // CU-14 flujo F1: limpiar filtros
  clearFilters() {
    this.selectedCategories.clear();
    this.annSvc.applyFilter(null);
  }

  getConteo(id_category: number): number {
    return this.allAnnotationCategories
      .filter(ac => ac.id_category === id_category).length;
  }

  isSelected(id: number) { return this.selectedCategories.has(id); }
  isExpanded(id: number) { return this.expanded.has(id); }
}