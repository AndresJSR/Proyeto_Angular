import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper">
      @for (row of rows; track row) {
        <div class="skeleton-row">
          @for (col of cols; track col) {
            <div class="skeleton-cell">
              <div class="skeleton-bar" [style.width]="col.width"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper { width: 100%; }

    .skeleton-row {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      gap: 16px;
    }

    .skeleton-cell { flex: 1; }

    .skeleton-bar {
      height: 14px;
      border-radius: 6px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    :host-context(.dark-theme) .skeleton-bar {
      background: linear-gradient(90deg, #243044 25%, #2e3f50 50%, #243044 75%);
      background-size: 200% 100%;
    }
  `],
})
export class SkeletonTableComponent {
  @Input() rowCount = 6;
  @Input() columns: { width: string }[] = [
    { width: '40%' }, { width: '30%' }, { width: '20%' }, { width: '10%' }
  ];

  get rows() { return Array(this.rowCount).fill(0); }
  get cols() { return this.columns; }
}
