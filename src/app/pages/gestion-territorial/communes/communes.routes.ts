import { Routes } from '@angular/router';

export const CommunesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.CommunesListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./form/form.component').then(m => m.CommunesFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.CommunesFormComponent),
  },
];