import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-seguimiento-stats-bar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './seguimiento-stats-bar.component.html',
  styleUrls: ['./seguimiento-stats-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeguimientoStatsBarComponent {
  readonly activos = input<number>(0);
  readonly sinConexion = input<number>(0);
  readonly total = input<number>(0);
  readonly lastUpdate = input<string | null>(null);

  readonly refreshClick = output<void>();
}
