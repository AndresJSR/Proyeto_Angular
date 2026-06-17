import { Routes } from '@angular/router';

export const CategoriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.CategoriesListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./form/form.component').then(m => m.CategoriesFormComponent),
  },
  {
    path: 'nueva-sub',
    loadComponent: () => import('./form/form.component').then(m => m.CategoriesFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form.component').then(m => m.CategoriesFormComponent),
  },
];