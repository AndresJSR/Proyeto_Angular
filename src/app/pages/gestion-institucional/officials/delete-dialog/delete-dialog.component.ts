import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfficialsAdminService } from '../officials.service';
import { Official } from '../../../../models/official.model';

@Component({
  selector: 'app-delete-official-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="delete-dialog">
      <div class="delete-icon"><mat-icon>delete_outline</mat-icon></div>
      <h2 class="delete-title">¿Eliminar funcionario?</h2>
      <p class="delete-body">
        Estás a punto de eliminar a <strong>{{ data.name }}</strong>.<br/>
        Esta acción no se puede deshacer.
      </p>
      <div class="delete-actions">
        <button mat-stroked-button mat-dialog-close class="w-full">Cancelar</button>
        <button mat-flat-button color="warn" class="w-full" [disabled]="deleting" (click)="confirm()">
          <mat-icon>{{ deleting ? 'hourglass_empty' : 'delete' }}</mat-icon>
          {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
        </button>
      </div>
    </div>
  `,
  styles: [\`
    .delete-dialog { padding: 8px 4px 4px; text-align: center; }
    .delete-icon { display:flex; justify-content:center; margin-bottom:12px;
      mat-icon { font-size:44px; width:44px; height:44px; color:#ef4444; } }
    .delete-title { font-size:18px; font-weight:700; color:#0f172a; margin:0 0 10px; }
    .delete-body  { font-size:14px; color:#64748b; margin:0 0 24px; line-height:1.5; }
    .delete-actions { display:flex; flex-direction:column; gap:10px; }
  \`],
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