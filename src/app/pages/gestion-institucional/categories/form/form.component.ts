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
  isSub     = signal(false);
  preview   = signal<string | null>(null);
  roots     = signal<Category[]>([]);
  file: File | null = null;

  form = this.fb.group({
    id_parent_category: [null as number | null],
    name:               ['', Validators.required],
    description:        [''],
    status:             ['active', Validators.required],
  });

  ngOnInit() {
    this.svc.getAll().subscribe(all => {
      this.roots.set(all.filter(c => c.id_parent_category === null));
    });

    // detectar si es sub por la ruta
    const url = this.router.url;
    if (url.includes('nueva-sub')) this.isSub.set(true);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(c => {
        this.form.patchValue(c);
        if (c.id_parent_category) this.isSub.set(true);
        if (c.image_url) this.preview.set(c.image_url);
      });
    }

    if (this.isSub()) {
      this.form.get('id_parent_category')!.setValidators(Validators.required);
      this.form.get('id_parent_category')!.updateValueAndValidity();
    }
  }

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.file = input.files[0];
    this.preview.set(URL.createObjectURL(this.file));
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const fd = new FormData();
    const v = this.form.value;
    if (v.id_parent_category) fd.append('id_parent_category', String(v.id_parent_category));
    fd.append('name', v.name ?? '');
    fd.append('description', v.description ?? '');
    fd.append('status', v.status ?? 'active');
    if (this.file) fd.append('file', this.file);

    const req$ = this.editId()
      ? this.svc.update(this.editId()!, fd)
      : this.svc.create(fd);

    req$.subscribe({
      next: () => {
        this.snack.open('Categoría guardada', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/categorias']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }

  get backRoute() { return '/gestion-institucional/categorias'; }
}