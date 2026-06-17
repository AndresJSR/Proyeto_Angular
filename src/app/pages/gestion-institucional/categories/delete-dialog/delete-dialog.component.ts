import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesAdminService } from '../categories.service';
import { Category } from '../category.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-delete-category-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Eliminar categoría</h2>
    <mat-dialog-content>
      @if (checking()) {
        <div class="space-y-2">
          <p class="text-sm text-muted">Verificando dependencias...</p>
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>
      } @else if (blockReason()) {
        <div class="p-3 rounded bg-light-error text-error text-sm space-y-1">
          <p><strong>No se puede eliminar "{{ data.name }}"</strong></p>
          <p>{{ blockReason() }}</p>
          <p class="italic text-xs">Reasigna o elimina las dependencias primero.</p>
        </div>
      } @else {
        <div class="space-y-2">
          <p class="text-base">¿Está seguro que desea eliminar la categoría <strong>{{ data.name }}</strong>?</p>
          <p class="text-sm text-muted italic">Esta acción no se puede deshacer.</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <button mat-stroked-button mat-dialog-close [disabled]="deleting()">Cancelar</button>
      @if (!blockReason() && !checking()) {
        <button mat-flat-button color="warn" [disabled]="deleting()" (click)="confirm()">
          <mat-icon>{{ deleting() ? 'hourglass_empty' : 'delete' }}</mat-icon>
          {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
        </button>
      }
    </mat-dialog-actions>
  `,
})
export class DeleteCategoryDialogComponent implements OnInit {
  data     = inject<Category>(MAT_DIALOG_DATA);
  ref      = inject(MatDialogRef);
  svc      = inject(CategoriesAdminService);
  snack    = inject(MatSnackBar);
  http     = inject(HttpClient);

  checking    = signal(true);
  deleting    = signal(false);
  blockReason = signal<string | null>(null);

  ngOnInit() {
    console.log('🗑️ [DeleteCategoryDialog] Abriendo diálogo para:', this.data.id_category, this.data.name);
    this.checkDependencies();
  }

  private checkDependencies() {
    this.checking.set(true);

    this.http.get<any[]>(`${environment.apiUrl}/api/categories`).subscribe({
      next: (all) => {
        const hasSubs = all.some(c => c.id_parent_category === this.data.id_category);
        if (hasSubs) {
          this.blockReason.set('Tiene subcategorías asociadas. Reasígnalas o elimínalas primero.');
          this.checking.set(false);
          return;
        }

        this.http.get<any[]>(`${environment.apiUrl}/api/annotation-categories`).subscribe({
          next: (acs) => {
            const hasAnnotations = acs.some(ac => ac.id_category === this.data.id_category);
            if (hasAnnotations) {
              this.blockReason.set('Tiene anotaciones asociadas. No se puede eliminar.');
            }
            this.checking.set(false);
          },
          error: () => this.checking.set(false),
        });
      },
      error: () => this.checking.set(false),
    });
  }

  confirm() {
    this.deleting.set(true);
    console.log('🗑️ [DeleteCategoryDialog] Intentando eliminar categoría ID:', this.data.id_category);

    this.svc.delete(this.data.id_category).subscribe({
      next: () => {
        console.log('✅ [DeleteCategoryDialog] Categoría eliminada correctamente');
        this.snack.open('✓ Categoría eliminada correctamente', '', { duration: 3000 });
        this.ref.close(true);
      },
      error: (err: any) => {
        this.deleting.set(false);
        console.error('❌ [DeleteCategoryDialog] Error al eliminar:', err);
        const msg = err?.error?.message || 'No se pudo eliminar la categoría. Intente nuevamente.';
        console.log('📢 Error message:', msg);
        console.log('📊 Status:', err.status);
        this.snack.open(msg, '✕', { duration: 5000 });
      },
    });
  }
}
