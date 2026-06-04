import { Component, inject, OnInit, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CitizensService } from '../citizens.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-citizens-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './form.component.html',
})
export class CitizensFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb     = inject(FormBuilder);
  private svc    = inject(CitizensService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving = signal(false);
  editId = signal<number | null>(null);

  private map!: L.Map;
  private marker?: L.Marker;

  form = this.fb.group({
    name:      ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    address:   [''],
    latitude:  [5.095],
    longitude: [-75.514],
    status:    ['active', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe(c => {
        this.form.patchValue(c);
      });
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    const lat = this.form.value.latitude ?? 5.095;
    const lng = this.form.value.longitude ?? -75.514;

    this.map = L.map('citizen-map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    if (this.editId()) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.form.patchValue({ latitude: lat, longitude: lng });
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map);
    });

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  ngOnDestroy() {
    this.map?.remove();
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
        this.snack.open('Ciudadano guardado', '✕', { duration: 3000 });
        this.router.navigate(['/gestion-institucional/ciudadanos']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al guardar', '✕', { duration: 3000 }); },
    });
  }
}