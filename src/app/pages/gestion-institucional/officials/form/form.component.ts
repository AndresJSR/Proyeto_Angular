import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesAdminService } from '../../entities/entities.service';
import { Entity } from '../../entities/entity.model';
import { Official } from '../official.model';
import { OfficialsAdminService } from '../officials.service';

// Custom validator for float numbers
const floatValidator = (control: AbstractControl) => {
  if (!control.value) return null;
  const value = parseFloat(control.value);
  return !isNaN(value) ? null : { invalidFloat: true };
};

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
    id_entity:      [null as number | null, Validators.required],
    name:           ['', [Validators.required, Validators.maxLength(160)]],
    email:          ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone:          ['', Validators.maxLength(40)],
    role:           ['', [Validators.required, Validators.maxLength(80)]],
    status:         ['active', Validators.required],
    last_latitude:  [null as number | null, [floatValidator]],
    last_longitude: [null as number | null, [floatValidator]],
    last_gps_update: [null as string | null],
    gps_active:     [true, Validators.required],
  });

  ngOnInit() {
    this.entSvc.getAll().subscribe(e => this.entities.set(e));

    // precargar entidad si viene de queryParam
    const idEntity = this.route.snapshot.queryParamMap.get('id_entity');
    if (idEntity) this.form.patchValue({ id_entity: +idEntity });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(o => {
        const official = o as Official;
        this.form.patchValue({
          id_entity: official.id_entity,
          name: official.name,
          email: official.email,
          phone: official.phone,
          role: official.role,
          status: official.status,
          last_latitude: official.last_latitude,
          last_longitude: official.last_longitude,
          last_gps_update: official.last_gps_update,
          gps_active: official.gps_active,
        });
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    
    const formValue = this.form.getRawValue();
    const body: Partial<Official> = {
      id_entity: formValue.id_entity!,
      name: formValue.name!,
      email: formValue.email!,
      phone: formValue.phone || '',
      role: formValue.role!,
      status: formValue.status!,
      last_latitude: formValue.last_latitude ? parseFloat(formValue.last_latitude as any) : 0,
      last_longitude: formValue.last_longitude ? parseFloat(formValue.last_longitude as any) : 0,
      last_gps_update: null,
      gps_active: formValue.gps_active!,
    };

    const req$ = this.editId()
      ? this.svc.update(this.editId()!, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => {
        this.snack.open('Funcionario guardado', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/funcionarios']);
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        this.snack.open(msg, '✕', { duration: 3000 });
      },
    });
  }
}
