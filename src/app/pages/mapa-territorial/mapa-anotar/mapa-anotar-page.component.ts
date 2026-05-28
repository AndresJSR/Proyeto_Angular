import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { AnotacionFormComponent as NuevaAnotacionFormComponent } from '../components/anotacion-form/anotacion-form.component';
import { CoordsTooltipComponent } from './components/coords-tooltip/coords-tooltip.component';
import { AnnotationsService } from '../services/annotations.service';
import { Annotation } from '../models/annotation.model';
import { AnotacionDetalleComponent } from '../components/anotacion-detalle/anotacion-detalle.component';

@Component({
  selector: 'app-mapa-anotar-page',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MapaBaseComponent,
    NuevaAnotacionFormComponent,
    CoordsTooltipComponent,
    AnotacionDetalleComponent,
  ],
  templateUrl: './mapa-anotar-page.component.html',
  styleUrls: ['./mapa-anotar-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaAnotarPageComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly annotationsService = inject(AnnotationsService);
  private readonly destroyRef = inject(DestroyRef);

  formCoords = signal<[number, number] | null>(null);
  showForm = signal(false);
  selectedAnnotation = signal<Annotation | null>(null);

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private readonly filtered$ = toObservable(this.annotationsService.filtered);

  ngOnInit(): void {
    // cargar anotaciones y suscribirse a cambios
    this.annotationsService.loadAll();
    this.filtered$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(anns => this.renderMarkers(anns));
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

  private renderMarkers(annotations: Annotation[]) {
    if (!this.map) return;
    if (!this.markersLayer) {
      this.markersLayer = L.layerGroup().addTo(this.map);
    }
    this.markersLayer.clearLayers();

    annotations.forEach(a => {
      const marker = L.marker([a.latitude, a.longitude]);
      marker.on('click', () => {
        this.selectedAnnotation.set(a);
        // close new-anotation form if open
        this.showForm.set(false);
        this.formCoords.set(null);
      });
      marker.addTo(this.markersLayer!);
    });
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
