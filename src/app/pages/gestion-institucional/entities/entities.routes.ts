import { Routes } from '@angular/router';

export const EntitiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.EntitiesListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./form/form.component').then(m => m.EntitiesFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.EntitiesFormComponent),
  },
];