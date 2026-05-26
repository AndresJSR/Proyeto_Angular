import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annotation } from '../../models/annotation.model';

@Component({
  selector: 'app-anotacion-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anotacion-detalle.component.html',
  styleUrl: './anotacion-detalle.component.scss'
})
export class AnotacionDetalleComponent {
  // CU-14 paso 10: detalle al hacer clic en marcador
  annotation = input<Annotation | null>(null);
}