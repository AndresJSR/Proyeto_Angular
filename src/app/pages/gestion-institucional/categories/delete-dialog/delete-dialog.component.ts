import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesAdminService } from '../categories.service';
import { Category } from '../category.model';

@Component({
  selector: 'app-delete-category-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar categoría</h2>
    <mat-dialog-content>
      ¿Eliminar <strong>{{ data.name }}</strong>?
      Si tiene subcategorías o anotaciones asociadas, no podrá eliminarse.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="deleting" (click)="confirm()">
        {{ deleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteCategoryDialogComponent {
  data     = inject<Category>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(CategoriesAdminService);
  snack    = inject(MatSnackBar);
  deleting = false;

  confirm() {
    this.deleting = true;
    this.svc.delete(this.data.id_category).subscribe({
      next: () => { this.snack.open('Categoría eliminada', '✕', { duration: 3000 }); this.ref.close(true); },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se puede eliminar: tiene dependencias asociadas.';
        this.snack.open(msg, '✕', { duration: 4000 });
      },
    });
  }
}