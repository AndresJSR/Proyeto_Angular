import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommunesService } from '../communes.service';

@Component({
  selector: 'app-communes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class CommunesFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(CommunesService);
  private http   = inject(HttpClient);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving         = signal(false);
  editId         = signal<number | null>(null);
  departments    = signal<any[]>([]);
  cities         = signal<any[]>([]);
  filteredCities = signal<any[]>([]);
  apiVerified    = signal(false);
  nameExists     = signal(false);
  errorMessage   = signal<string | null>(null);

  form = this.fb.group({
    id_department: [null as number | null, Validators.required],
    id_city:       [null as number | null, Validators.required],
    name:          ['', Validators.required],
    status:        ['active', Validators.required],
  });

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/departments`).subscribe(d => this.departments.set(d));
    this.http.get<any[]>(`${environment.apiUrl}/api/cities`).subscribe(c => this.cities.set(c));

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editId.set(+id);

      this.svc.getById(+id).subscribe((c: any) => {
        this.form.patchValue(c);
        this.onDeptChange(c.id_department);
        this.form.patchValue({ id_city: c.id_city });
        this.apiVerified.set(true);
      });
    }
  }

  onDeptChange(id: number | null) {
    this.form.patchValue({ id_department: id, id_city: null });
    this.filteredCities.set(this.cities().filter(c => c.id_department === id));
    this.apiVerified.set(false);
    this.nameExists.set(false);
    this.errorMessage.set(null);
  }

  onCityChange(id: number | null) {
    this.form.patchValue({ id_city: id });

    if (id) {
      this.apiVerified.set(true);
    }

    this.nameExists.set(false);
    this.errorMessage.set(null);
  }

  onNameInput() {
    this.nameExists.set(false);
    this.errorMessage.set(null);
  }

  closeError() {
    this.errorMessage.set(null);
  }

  private normalize(str: string): string {
    return str.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  checkNameExists() {
    const name = this.form.value.name;
    const idCity = this.form.value.id_city;

    if (!name?.trim() || !idCity) {
      this.nameExists.set(false);
      this.errorMessage.set(null);
      return;
    }

    const normalized = this.normalize(name);

    this.svc.searchByCity(idCity).subscribe((communes: any[]) => {
      const exists = communes.some(c =>
        this.normalize(c.name) === normalized &&
        c.id_commune !== this.editId()
      );

      this.nameExists.set(exists);

      if (exists) {
        this.errorMessage.set('Ya existe una comuna con ese nombre.');
      } else {
        this.errorMessage.set(null);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.nameExists()) {
      this.errorMessage.set('Ya existe una comuna con ese nombre.');
      return;
    }

    this.saving.set(true);

    const { id_department, ...body } = this.form.value as any;

    const req$ = this.editId()
      ? this.svc.update(this.editId()!, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => {
        this.snack.open('✓ Comuna guardada', '', { duration: 3000 });
        this.router.navigate(['/gestion-territorial/comunas']);
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        this.snack.open(msg, '✕', { duration: 3000 });
      },
    });
  }
}
