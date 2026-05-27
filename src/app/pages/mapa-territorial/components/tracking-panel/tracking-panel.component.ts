import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { OfficialsService } from '../../services/officials.service';
import { Official } from '../../models/official.model';

@Component({
  selector: 'app-tracking-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './tracking-panel.component.html',
})
export class TrackingPanelComponent implements OnInit {
  private svc = inject(OfficialsService);

  officials = signal<Official[]>([]);
  filtered = signal<Official[]>([]);
  entities = signal<{ id: number; name: string }[]>([]);
  selectedEntity = signal<number | null>(null);
  noResults = signal(false);

  officialsUpdate = output<Official[]>();

  ngOnInit() {
    this.svc.officials$.subscribe(data => {
      this.officials.set(data);
      this.applyFilter();
      this.buildEntities(data);
    });
  }

  filterByEntity(id: number | null) {
    this.selectedEntity.set(id);
    this.applyFilter();
  }

  private applyFilter() {
    const id = this.selectedEntity();
    const result = id
      ? this.officials().filter(o => o.id_entity === id)
      : this.officials();
    this.noResults.set(result.length === 0);
    this.filtered.set(result);
    this.officialsUpdate.emit(result);
  }

  private buildEntities(officials: Official[]) {
    const map = new Map<number, string>();
    officials.forEach(o => map.set(o.id_entity, `Entidad ${o.id_entity}`));
    this.entities.set([...map.entries()].map(([id, name]) => ({ id, name })));
  }
}