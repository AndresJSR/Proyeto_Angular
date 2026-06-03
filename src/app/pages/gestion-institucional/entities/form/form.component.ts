import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesAdminService } from '../entities.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-entities-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class EntitiesFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(EntitiesAdminService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving   = signal(false);
  editId   = signal<number | null>(null);
  preview  = signal<string | null>(null);
  file: File | null = null;

  form = this.fb.group({
    name:    ['', Validators.required],
    nit:     ['', Validators.required],
    phone:   [''],
    email:   ['', [Validators.required, Validators.email]],
    address: [''],
    status:  ['active', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(e => {
        this.form.patchValue(e);
        if (e.logo_url) this.preview.set(e.logo_url);
      });
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
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, v as string));
    if (this.file) fd.append('file', this.file);

    const req$ = this.editId()
      ? this.svc.update(this.editId()!, fd)
      : this.svc.create(fd);

    req$.subscribe({
      next: () => {
        this.snack.open('Entidad guardada', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/entidades']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }
}