import { Routes } from '@angular/router';

export const AnotacionesRoutes: Routes = [
  {
    path: 'crear',
    loadComponent: () =>
      import('./crear/crear.component').then(m => m.CrearComponent)
  },
  {
    path: 'visualizar',
    loadComponent: () =>
      import('./visualizar/visualizar.component').then(m => m.VisualizarComponent)
  },
  {
    path: 'evidencias',
    loadComponent: () =>
      import('./evidencias/evidencias.component').then(m => m.EvidenciasComponent)
  }
];