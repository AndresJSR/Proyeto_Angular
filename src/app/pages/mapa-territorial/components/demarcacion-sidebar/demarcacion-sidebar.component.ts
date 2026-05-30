import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-demarcacion-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demarcacion-sidebar.component.html',
  styleUrls: ['./demarcacion-sidebar.component.scss'],
})
export class DemarcacionSidebarComponent {
  readonly coords = input<ReadonlyArray<[number, number]>>([]);
  readonly isSaving = input(false);
  readonly hasActiveNeighborhood = input(false);
  readonly isEditing = input(false);

  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly clear = output<void>();
}
