import { Routes } from '@angular/router';
//hhh
export const CitizensRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.CitizensListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form.component').then(m => m.CitizensFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.CitizensFormComponent),
  },
];