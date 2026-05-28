import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coords-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coords-tooltip.component.html',
  styleUrls: ['./coords-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordsTooltipComponent {
  coords = input<[number, number] | null>(null);
}
