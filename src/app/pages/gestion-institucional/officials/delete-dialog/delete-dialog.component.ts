import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfficialsAdminService } from '../officials.service';
import { Official } from '../official.model';

@Component({
  selector: 'app-delete-official-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar funcionario</h2>
    <mat-dialog-content>
      ¿Eliminar a <strong>{{ data.name }}</strong>? Esta acción no se puede deshacer.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
        {{ deleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteOfficialDialogComponent {
  data     = inject<Official>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(OfficialsAdminService);
  snack    = inject(MatSnackBar);
  deleting = false;

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.id_official).subscribe({
      next: () => { this.snack.open('Funcionario eliminado', '✕', { duration: 3000 }); this.ref.close(true); },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se puede eliminar: tiene registros asociados.';
        this.snack.open(msg, '✕', { duration: 4000 });
      },
    });
  }
}