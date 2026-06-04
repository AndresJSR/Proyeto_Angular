import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfficialsAdminService } from '../officials.service';
import { EntitiesAdminService } from '../../entities/entities.service';
import { Entity } from '../../entities/entity.model';

@Component({
  selector: 'app-officials-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class OfficialsFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private svc     = inject(OfficialsAdminService);
  private entSvc  = inject(EntitiesAdminService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private snack   = inject(MatSnackBar);

  saving   = signal(false);
  editId   = signal<number | null>(null);
  entities = signal<Entity[]>([]);

  form = this.fb.group({
    id_entity: [null as number | null, Validators.required],
    name:      ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    role:      ['', Validators.required],
    status:    ['active', Validators.required],
    gps_active:[true],
  });

  ngOnInit() {
    this.entSvc.getAll().subscribe(e => this.entities.set(e));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(o => this.form.patchValue(o));
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
        this.snack.open('Funcionario guardado', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/funcionarios']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }
}