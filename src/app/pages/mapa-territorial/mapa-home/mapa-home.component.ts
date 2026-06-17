import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MapaHomeService } from './mapa-home.service';
import { MapaHomeOption } from '../../../models/mapa-home-option.model';
import { GlowCardDirective } from '../../../shared/directives/glow-card.directive';

@Component({
  selector: 'app-mapa-home',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, TablerIconsModule, GlowCardDirective],
  templateUrl: './mapa-home.component.html',
  styleUrls: ['./mapa-home.component.scss'],
})
export class MapaHomeComponent {
  private readonly mapaHomeService = inject(MapaHomeService);
  readonly options: MapaHomeOption[] = this.mapaHomeService.getOptions();
}