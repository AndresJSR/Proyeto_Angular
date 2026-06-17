import { Routes } from '@angular/router';

export const OfficialsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.OfficialsListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form.component').then(m => m.OfficialsFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.OfficialsFormComponent),
  },
];