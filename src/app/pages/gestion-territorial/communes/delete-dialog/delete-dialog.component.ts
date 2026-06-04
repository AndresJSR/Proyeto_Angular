import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommunesService } from '../communes.service';
import { Commune } from '../commune.model';

@Component({
  selector: 'app-delete-commune-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar comuna</h2>
    <mat-dialog-content>
      ¿Eliminar <strong>{{ data.name }}</strong>?
      Si tiene barrios asociados no podrá eliminarse.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
        {{ deleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteCommuneDialogComponent {
  data     = inject<Commune>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(CommunesService);
  snack    = inject(MatSnackBar);
  deleting = false;

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.id_commune).subscribe({
      next: () => { this.snack.open('Comuna eliminada', '✕', { duration: 3000 }); this.ref.close(true); },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se puede eliminar: tiene barrios asociados.';
        this.snack.open(msg, '✕', { duration: 4000 });
      },
    });
  }
}