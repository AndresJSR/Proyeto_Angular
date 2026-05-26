import { Routes } from '@angular/router';
import { MapaTerritorialComponent } from './mapa-territorial.component';

export const MapaTerritorialRoutes: Routes = [
  {
    path: '',
    component: MapaTerritorialComponent,
    data: {
      title: 'Mapa Territorial',
    }
  }
];