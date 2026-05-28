import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaBaseComponent } from '../components/mapa-base/mapa-base.component';
import { MAPA_BASE_LAYERS } from '../components/mapa-base/mapa-base-layers';

@Component({
  selector: 'app-mapa-ver',
  standalone: true,
  imports: [CommonModule, MapaBaseComponent],
  templateUrl: './mapa-ver.component.html',
  styleUrls: ['./mapa-ver.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaVerComponent {
  readonly layers = MAPA_BASE_LAYERS;
}