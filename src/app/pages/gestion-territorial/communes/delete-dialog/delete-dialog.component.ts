import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommunesService } from '../communes.service';

@Component({
  selector: 'app-delete-commune-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar comuna</h2>
    <mat-dialog-content>
      @if (data.barrios.length > 0) {
        <div class="p-3 rounded bg-light-warning text-warning text-sm space-y-2">
          <p><strong>No se puede eliminar "{{ data.commune.name }}"</strong></p>
          <p>La comuna tiene <strong>{{ data.barrios.length }} barrios asociados.</strong></p>
          <p class="font-semibold underline cursor-pointer" (click)="showBarrios = !showBarrios">
            Ver barrios dependientes ({{ data.barrios.length }})
          </p>
          @if (showBarrios) {
            <ul class="list-disc pl-4 text-xs">
              @for (b of data.barrios; track b.id_neighborhood) {
                <li>{{ b.name }}</li>
              }
            </ul>
          }
          <p class="italic text-xs">Elimina o reasigna los barrios antes de eliminar la comuna.</p>
        </div>
      } @else {
        <div class="space-y-2">
          <p>¿Eliminar <strong>{{ data.commune.name }}</strong>?</p>
          <p class="text-sm text-muted italic">Esta acción no se puede deshacer.</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      @if (data.barrios.length === 0) {
        <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
          <mat-icon>{{ deleting ? 'hourglass_empty' : 'delete' }}</mat-icon>
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      }
    </mat-dialog-actions>
  `,
})
export class DeleteCommuneDialogComponent {
  data     = inject<{ commune: any; barrios: any[] }>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(CommunesService);
  snack    = inject(MatSnackBar);
  deleting = false;
  showBarrios = false;

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.commune.id_commune).subscribe({
      next: () => {
        this.snack.open('✓ Comuna eliminada', '', { duration: 3000 });
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
