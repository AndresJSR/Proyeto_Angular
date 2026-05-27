import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarriosService } from '../../services/barrios.service';
import { Barrio } from '../../models/barrio.model';
import { MaterialModule } from 'src/app/material.module';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-demarcacion-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './demarcacion-panel.component.html',
})
export class DemarcacionPanelComponent implements OnInit {
  private barriosSvc = inject(BarriosService);

  barrios = signal<Barrio[]>([]);
  selected = signal<Barrio | null>(null);
  saving = signal(false);

  // output hacia mapa-territorial para activar modo edición
  barrioSeleccionado = output<Barrio | null>();
  guardado = output<void>();

  ngOnInit() {
    this.barriosSvc.getAll().subscribe(b => this.barrios.set(b));
  }

  select(b: Barrio) {
    this.selected.set(b);
    this.barrioSeleccionado.emit(b);
  }

  save(coords: [number, number][]) {
    if (coords.length < 3) return;

    const b = this.selected();
    if (!b) return;

    // 5a: cerrar polígono automáticamente
    if (coords.length > 1) {
      const first = coords[0], last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords = [...coords, first];
      }
    }

    this.saving.set(true);

    this.barriosSvc.getPointsByNeighborhood(b.id_neighborhood).subscribe({
      next: (existing: any[]) => {
        // Filtrar solo boundary de este barrio
        const toDelete = existing.filter(
          p => p.point_type === 'boundary' && p.id_neighborhood === b.id_neighborhood
        );

        const proceed = () =>
          this.barriosSvc.savePolygon(b.id_neighborhood, coords).subscribe({
            next: () => {
              this.saving.set(false);
              this.guardado.emit();
            },
            error: () => this.saving.set(false)
          });

        if (toDelete.length) {
          forkJoin(toDelete.map((p: any) => this.barriosSvc.deletePoint(p.id_point)))
            .subscribe({ next: proceed, error: proceed });
        } else {
          proceed();
        }
      },
      error: () => this.saving.set(false)
    });
  }
}