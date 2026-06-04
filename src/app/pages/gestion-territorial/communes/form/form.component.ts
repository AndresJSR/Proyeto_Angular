import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommunesService } from '../communes.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface City { id_city: number; name: string; }

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

  saving = signal(false);
  editId = signal<number | null>(null);
  cities = signal<City[]>([]);

  form = this.fb.group({
    id_city: [null as number | null, Validators.required],
    name:    ['', Validators.required],
    status:  ['active', Validators.required],
  });

  ngOnInit() {
    this.http.get<City[]>(`${environment.apiUrl}/api/cities`)
      .subscribe(c => this.cities.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(c => this.form.patchValue(c));
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.value as any;
    const req$ = this.editId()
      ? this.svc.update(this.editId()!, body)
      : this.svc.create(body);
    req$.subscribe({
      next: () => {
        this.snack.open('Comuna guardada', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-territorial/comunas']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }
}