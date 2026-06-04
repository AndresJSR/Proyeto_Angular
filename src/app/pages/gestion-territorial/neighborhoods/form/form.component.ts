import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NeighborhoodsService } from '../neighborhoods.service';
import { CommunesService } from '../../communes/communes.service';
import { Commune } from '../../communes/commune.model';

@Component({
  selector: 'app-neighborhoods-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class NeighborhoodsFormComponent implements OnInit {
  private fb         = inject(FormBuilder);
  private svc        = inject(NeighborhoodsService);
  private communeSvc = inject(CommunesService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private snack      = inject(MatSnackBar);

  saving   = signal(false);
  editId   = signal<number | null>(null);
  communes = signal<Commune[]>([]);

  form = this.fb.group({
    id_commune: [null as number | null, Validators.required],
    name:       ['', Validators.required],
    status:     ['active', Validators.required],
  });

  ngOnInit() {
    this.communeSvc.getAll().subscribe(c => this.communes.set(c));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(n => this.form.patchValue(n));
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
        this.snack.open('Barrio guardado', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-territorial/barrios']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }
}