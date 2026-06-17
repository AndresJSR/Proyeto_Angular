import { Routes } from '@angular/router';

export const NeighborhoodsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.NeighborhoodsListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form.component').then(m => m.NeighborhoodsFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.NeighborhoodsFormComponent),
  },
];