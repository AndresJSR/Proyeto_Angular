import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NeighborhoodsService } from '../neighborhoods.service';

@Component({
  selector: 'app-delete-neighborhood-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar barrio</h2>
    <mat-dialog-content>
      @if (hasDependencies()) {
        <div class="p-3 rounded bg-light-warning text-warning text-sm space-y-2">
          <p><strong>No se puede eliminar "{{ data.neighborhood.name }}"</strong></p>
          @if (data.points > 0) {
            <p>Tiene <strong>{{ data.points }} puntos geográficos</strong> asociados.</p>
          }
          @if (data.annotations > 0) {
            <p>Tiene <strong>{{ data.annotations }} anotaciones</strong> asociadas.</p>
          }
          <p class="italic text-xs">Elimina las dependencias antes de eliminar el barrio.</p>
        </div>
      } @else {
        <div class="space-y-2">
          <p>¿Eliminar <strong>{{ data.neighborhood.name }}</strong>?</p>
          <p class="text-sm text-muted italic">Esta acción no se puede deshacer.</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      @if (!hasDependencies()) {
        <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
          <mat-icon>{{ deleting ? 'hourglass_empty' : 'delete' }}</mat-icon>
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      }
    </mat-dialog-actions>
  `,
})
export class DeleteNeighborhoodDialogComponent {
  data     = inject<{ neighborhood: any; points: number; annotations: number }>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(NeighborhoodsService);
  snack    = inject(MatSnackBar);
  deleting = false;

  hasDependencies(): boolean {
    return this.data.points > 0 || this.data.annotations > 0;
  }

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.neighborhood.id_neighborhood).subscribe({
      next: () => {
        this.snack.open('✓ Barrio eliminado', '', { duration: 3000 });
        this.ref.close(true);
      },
      error: (err: any) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se puede eliminar.';
        this.snack.open(msg, '✕', { duration: 4000 });
      },
    });
  }
}
