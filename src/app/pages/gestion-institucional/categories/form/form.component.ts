import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesAdminService } from '../categories.service';
import { Category } from '../category.model';

@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class CategoriesFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(CategoriesAdminService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving    = signal(false);
  editId    = signal<number | null>(null);
  preview   = signal<string | null>(null);
  roots     = signal<Category[]>([]);
  forbiddenParents = signal<Set<number>>(new Set());
  selectedFile: File | null = null;
  fileError = signal<string | null>(null);

  readonly ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

  form = this.fb.group({
    id_parent_category: [null as number | null],
    name:               ['', Validators.required],
    description:        [''],
    status:             ['active', Validators.required],
  });

  get isSubcategory(): boolean {
    return !!this.form.value.id_parent_category;
  }

  ngOnInit() {
    this.svc.getAll().subscribe(all => {
      const roots = all.filter(c => c.id_parent_category === null);
      
      // Al editar, excluir la categoría actual y sus subcategorías como padres posibles
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.editId.set(+id);
        const forbidden = this.getDescendants(+id, all);
        forbidden.add(+id); // No puede ser padre de sí misma
        this.forbiddenParents.set(forbidden);
        
        // Cargar los datos de la categoría
        this.svc.getById(+id).subscribe(c => {
          this.form.patchValue(c);
          if (c.image_url) this.preview.set(c.image_url);
        });
      }
      
      this.roots.set(roots);
    });
  }

  private getDescendants(parentId: number, all: Category[]): Set<number> {
    const descendants = new Set<number>();
    const queue = [parentId];
    
    while (queue.length) {
      const current = queue.shift()!;
      const children = all.filter(c => c.id_parent_category === current);
      children.forEach(child => {
        descendants.add(child.id_category);
        queue.push(child.id_category);
      });
    }
    
    return descendants;
  }

  canSelectAsParent(categoryId: number): boolean {
    return !this.forbiddenParents().has(categoryId);
  }

  onFile(event: Event) {
    this.fileError.set(null);
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !this.ALLOWED_EXTENSIONS.includes(ext)) {
      this.fileError.set(`Extensión no permitida. Solo: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
      this.selectedFile = null;
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.fileError.set('El archivo debe ser una imagen');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.fileError.set('Imagen muy grande. Máximo 5MB');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.preview.set(URL.createObjectURL(file));
  }

  submit() {
    if (this.form.invalid) return;

    // Imagen requerida en creación solo si NO es subcategoría
    if (!this.editId() && !this.isSubcategory && !this.selectedFile) {
      this.fileError.set('Debes seleccionar una imagen para crear la categoría');
      this.snack.open('Imagen requerida', '✕', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    const fd = new FormData();
    const v = this.form.value;

    fd.append('name', v.name ?? '');
    fd.append('status', v.status ?? 'active');

    if (v.description) fd.append('description', v.description);

    if (v.id_parent_category) {
      fd.append('id_parent_category', String(v.id_parent_category));
    }

    if (this.selectedFile) {
      fd.append('file', this.selectedFile);
    }

    const req$ = this.editId()
      ? this.svc.update(this.editId()!, fd)
      : this.svc.create(fd);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Categoría guardada', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/categorias']);
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar la categoría';
        this.snack.open(msg, '✕', { duration: 5000 });
      },
    });
  }

  get backRoute() { return '/gestion-institucional/categorias'; }
}