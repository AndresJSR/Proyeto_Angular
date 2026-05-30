import { Component, signal, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { AnotacionFormComponent } from '../../mapa-territorial/components/anotacion-form/anotacion-form.component';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [CommonModule, MaterialModule, AnotacionFormComponent],
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.scss'
})
export class CrearComponent implements AfterViewInit {
  private router = inject(Router);
  coords = signal<[number, number] | null>(null);
  mapReady = signal(false);
  private map!: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = L.map('map-crear').setView([5.095, -75.514], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 200);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.coords.set([e.latlng.lat, e.latlng.lng]);
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
      this.mapReady.set(true);
    });
  }

  onSaved() {
    this.router.navigate(['/gestion-territorial/mapa']);
  }

  onCancelled() {
    this.coords.set(null);
    this.mapReady.set(false);
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }
  }
}