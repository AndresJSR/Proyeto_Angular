import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CitizensService } from '../citizens.service';
import { MapaBaseComponent } from '../../../mapa-territorial/components/mapa-base/mapa-base.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-citizens-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule, MapaBaseComponent],
  templateUrl: './form.component.html',
})
export class CitizensFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(CitizensService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving = signal(false);
  editId = signal<number | null>(null);

  private map?: L.Map;
  private marker?: L.CircleMarker;

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
        if (this.map && c.latitude && c.longitude) {
          this.map.flyTo([c.latitude, c.longitude], 15, { duration: 0.8 });
          this.placeMarker(c.latitude, c.longitude);
        }
      });
    }
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    const lat = this.form.value.latitude;
    const lng = this.form.value.longitude;
    if (lat && lng && this.editId()) {
      map.setView([lat, lng], 15);
      this.placeMarker(lat, lng);
    }
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;
    this.form.patchValue({ latitude: lat, longitude: lng });
    this.placeMarker(lat, lng);
  }

  private placeMarker(lat: number, lng: number): void {
    if (!this.map) return;
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#4f46e5',
      color: '#fff',
      weight: 3,
      fillOpacity: 1,
    }).bindPopup('Ubicación del ciudadano').addTo(this.map);
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
