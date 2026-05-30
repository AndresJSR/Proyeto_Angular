import { Routes } from '@angular/router';
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
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./mapa-seguimiento/mapa-seguimiento-page.component').then(
        (m) => m.MapaSeguimientoPageComponent
      ),
  },
  {
    path: 'anotar',
    loadComponent: () =>
      import('./mapa-anotar/mapa-anotar-page.component').then(
        (m) => m.MapaAnotarPageComponent
      ),
  },
  {
    path: 'filtros',
    loadComponent: () =>
      import('./mapa-filtros/mapa-filtros-page.component').then(
        (m) => m.MapaFiltrosPageComponent
      ),
  },
];
