import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesAdminService } from '../entities.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Entity } from '../entity.model';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar entidad</h2>
    <mat-dialog-content>
      ¿Eliminar <strong>{{ data.name }}</strong>? Esta acción no se puede deshacer.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
        {{ deleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteDialogComponent {
  data    = inject<Entity>(MAT_DIALOG_DATA);
  ref     = inject(MatDialogRef);
  svc     = inject(EntitiesAdminService);
  snack   = inject(MatSnackBar);
  deleting = false;

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.id_entity).subscribe({
      next: () => { this.snack.open('Entidad eliminada', '✕', { duration: 3000 }); this.ref.close(true); },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se puede eliminar: tiene dependencias asociadas.';
        this.snack.open(msg, '✕', { duration: 4000 });
      },
    });
  }
}