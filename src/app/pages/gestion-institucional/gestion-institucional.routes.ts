import { Routes } from '@angular/router';

export const GestionInstitucionalRoutes: Routes = [
  {
    path: 'entidades',
    loadChildren: () => import('./entities/entities.routes').then(m => m.EntitiesRoutes),
  },
  {
    path: 'funcionarios',
    loadChildren: () => import('./officials/officials.routes').then(m => m.OfficialsRoutes),
  },
];  