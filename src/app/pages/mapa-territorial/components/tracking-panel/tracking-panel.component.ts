import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { Official } from '../../../../models/official.model';

@Component({
  selector: 'app-tracking-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './tracking-panel.component.html',
  styleUrls: ['./tracking-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingPanelComponent {
  readonly officials = input<Official[]>([]);
  readonly selectedId = input<number | null>(null);

  entities = signal<{ id: number; name: string }[]>([]);
  selectedEntity = signal<number | null>(null);
  searchQuery = signal('');

  readonly filtered = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const entityId = this.selectedEntity();

    return this.officials().filter((official) => {
      const matchesEntity = entityId === null || official.id_entity === entityId;
      const matchesQuery = !query || (official.name?.toLowerCase().includes(query) ?? false);
      return matchesEntity && matchesQuery;
    });
  });

  officialsUpdate = output<Official[]>();
  officialSelected = output<Official>();

  constructor() {
    effect(() => {
      this.buildEntities();
      this.officialsUpdate.emit(this.filtered());
    });
  }

  filterByEntity(id: number | null) {
    this.selectedEntity.set(id);
  }

  selectOfficial(official: Official) {
    this.officialSelected.emit(official);
  }

  private buildEntities() {
    const map = new Map<number, string>();
    this.officials().forEach((official) => map.set(official.id_entity, `Entidad ${official.id_entity}`));
    this.entities.set([...map.entries()].map(([id, name]) => ({ id, name })));
  }
}