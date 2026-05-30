import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-anotar-filters-bar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './anotar-filters-bar.component.html',
  styleUrls: ['./anotar-filters-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnotarFiltersBarComponent {
  communes = input<{ id: number; name: string }[]>([]);
  barrios = input<{ id: number; name: string; id_commune: number }[]>([]);
  categories = input<Category[]>([]);
  selectedCommune = input<number | null>(null);
  selectedBarrio = input<number | null>(null);
  selectedCategories = input<Set<number>>(new Set());

  communeChange = output<number | null>();
  barrioChange = output<number | null>();
  categoryToggle = output<number>();
  filtrosClick = output<void>();

  barriosFiltrados = computed(() => {
    const idCommune = this.selectedCommune();
    if (idCommune == null) {
      return this.barrios();
    }
    return this.barrios().filter(barrio => barrio.id_commune === idCommune);
  });

  onCommuneChange(value: number | null) {
    this.communeChange.emit(value);
  }

  onBarrioChange(value: number | null) {
    this.barrioChange.emit(value);
  }

  onCategoryChange(value: number | null) {
    if (value == null) {
      return;
    }
    this.categoryToggle.emit(value);
  }
}
