import { Routes } from '@angular/router';
import { MapaTerritorialComponent } from './mapa-territorial.component';
import { MapaHomeComponent } from './mapa-home/mapa-home.component';
import { MapaVerComponent } from './mapa-ver/mapa-ver.component';

export const MapaTerritorialRoutes: Routes = [
  { path: '', component: MapaHomeComponent },
  { path: 'ver', component: MapaVerComponent },
  {
    path: 'demarcacion',
    loadComponent: () =>
      import('./mapa-demarcacion/pages/mapa-demarcacion-page.component').then(
        (m) => m.MapaDemarcacionPageComponent
      ),
  },
  { path: 'seguimiento', component: MapaTerritorialComponent, data: { mode: 'tracking' } },
  { path: 'anotar', component: MapaTerritorialComponent, data: { mode: 'mapa' } },
  { path: 'filtros', component: MapaTerritorialComponent, data: { mode: 'mapa' } },
];