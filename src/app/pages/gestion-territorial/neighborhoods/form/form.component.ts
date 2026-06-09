import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { Commune } from '../../communes/commune.model';
import { CommunesService } from '../../communes/communes.service';
import { NeighborhoodsService } from '../neighborhoods.service';

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

  onSaved = output<void>();
  onCancel = output<void>();
  selectedNeighborhood = input<any>(null);

  saving         = signal(false);
  editId         = signal<number | null>(null);
  communes       = signal<Commune[]>([]);
  nameExists     = signal(false);
  errorMessage   = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.group({
    id_commune: [null as number | null, Validators.required],
    name:       ['', Validators.required],
    status:     ['active', Validators.required],
  });

  constructor() {
    effect(() => {
      const selected = this.selectedNeighborhood();
      if (selected !== null) {
        if (selected.id_neighborhood) {
          // Editar barrio existente
          this.editId.set(selected.id_neighborhood);
          this.form.patchValue(selected);
        } else {
          // Nuevo barrio
          this.editId.set(null);
          this.form.reset({ status: 'active', id_commune: null, name: '' });
        }
        this.nameExists.set(false);
        this.errorMessage.set(null);
        this.successMessage.set(null);
      }
    });
  }

  ngOnInit() {
    this.communeSvc.getAll().subscribe(c => this.communes.set(c));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(n => this.form.patchValue(n));
    }
  }

  onCommuneChange(id: number | null) {
    this.form.patchValue({ id_commune: id });
    this.nameExists.set(false);
    this.errorMessage.set(null);
  }

  closeError() {
    this.errorMessage.set(null);
  }

  cancel() {
    this.form.reset({ status: 'active', id_commune: null });
    this.editId.set(null);
    this.nameExists.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.onCancel.emit();
  }

  private normalize(str: string): string {
    return str.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  checkNameExists() {
    const name = this.form.value.name;
    const idCommune = this.form.value.id_commune;
    if (!name?.trim() || !idCommune) return;

    const normalized = this.normalize(name);

    this.svc.searchByCommune(idCommune).subscribe(neighborhoods => {
      this.nameExists.set(
        neighborhoods.some(n =>
          this.normalize(n.name) === normalized &&
          n.id_neighborhood !== this.editId()
        )
      );
    });
  }

  submit() {
    if (this.form.invalid || this.nameExists()) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const body = this.form.value as any;
    const req$ = this.editId()
      ? this.svc.update(this.editId()!, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => {
        this.successMessage.set(`✓ ${this.editId() ? 'Barrio actualizado' : 'Barrio creado'}`);
        this.form.reset({ status: 'active', id_commune: null });
        this.editId.set(null);
        this.nameExists.set(false);
        setTimeout(() => {
          this.successMessage.set(null);
          this.onSaved.emit();
        }, 1500);
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        
        if (msg.toLowerCase().includes('nombre') || msg.toLowerCase().includes('duplicado')) {
          this.errorMessage.set('Nombre duplicado. Ya existe un barrio con ese nombre en la comuna seleccionada.');
        } else if (msg.toLowerCase().includes('dependencia') || msg.toLowerCase().includes('asociada')) {
          this.errorMessage.set('No se puede eliminar. El barrio tiene puntos o anotaciones asociadas.');
        } else {
          this.snack.open(msg, '✕', { duration: 3000 });
        }
      },
    });
  }
}