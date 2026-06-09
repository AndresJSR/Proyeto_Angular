import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { Neighborhood } from '../neighborhood.model';
import { NeighborhoodsService } from '../neighborhoods.service';

@Component({
  selector: 'app-delete-neighborhood-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar barrio</h2>
    <mat-dialog-content>
      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded bg-light-error border-l-4 border-error flex items-start gap-2">
          <mat-icon class="text-error flex-shrink-0 text-xl">warning</mat-icon>
          <div>
            <p class="font-semibold text-error">No se puede eliminar</p>
            <p class="text-sm text-error mt-1">{{ errorMessage() }}</p>
          </div>
        </div>
      } @else {
        <p>¿Eliminar <strong>{{ data.name }}</strong> de la comuna seleccionada?</p>
        <p class="text-sm text-muted mt-2">Si tiene puntos geográficos o anotaciones asociadas no podrá eliminarse.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close [disabled]="deleting()">Cancelar</button>
      @if (!errorMessage()) {
        <button mat-flat-button color="warn" [disabled]="deleting()" (click)="confirm()">
          {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
        </button>
      } @else {
        <button mat-flat-button color="primary" mat-dialog-close>Entendido</button>
      }
    </mat-dialog-actions>
  `,
})
export class DeleteNeighborhoodDialogComponent {
  data         = inject<Neighborhood>(MAT_DIALOG_DATA);
  ref          = inject(MatDialogRef);
  svc          = inject(NeighborhoodsService);
  snack        = inject(MatSnackBar);
  deleting     = signal(false);
  errorMessage = signal<string | null>(null);

  confirm() {
    this.deleting.set(true);
    this.svc.delete(this.data.id_neighborhood).subscribe({
      next: () => {
        this.snack.open('✓ Barrio eliminado correctamente', '', { duration: 3000 });
        this.ref.close(true);
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message ?? 'No se puede eliminar. El barrio tiene puntos o anotaciones asociadas.';
        this.errorMessage.set(msg);
      },
    });
  }
}