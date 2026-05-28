import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { AnotacionFormComponent as NuevaAnotacionFormComponent } from '../components/anotacion-form/anotacion-form.component';
import { CoordsTooltipComponent } from './components/coords-tooltip/coords-tooltip.component';

@Component({
  selector: 'app-mapa-anotar-page',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MapaBaseComponent,
    NuevaAnotacionFormComponent,
    CoordsTooltipComponent,
  ],
  templateUrl: './mapa-anotar-page.component.html',
  styleUrls: ['./mapa-anotar-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaAnotarPageComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);

  formCoords = signal<[number, number] | null>(null);
  showForm = signal(false);

  private map?: L.Map;

  ngOnInit(): void {
  }

  onMapReady(map: L.Map): void {
    this.map = map;
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    this.formCoords.set([e.latlng.lat, e.latlng.lng]);
    this.showForm.set(true);
    this.snackBar.open(
      'Punto seleccionado — Las coordenadas se han cargado en el formulario.',
      'OK',
      { duration: 2800 }
    );
  }

  onFormSaved(_id: number): void {
    this.showForm.set(false);
    this.formCoords.set(null);
  }

  onFormClosed(): void {
    this.showForm.set(false);
    this.formCoords.set(null);
  }
}
