import { Routes } from '@angular/router';

export const GestionTerritorialRoutes: Routes = [
  {
    path: 'comunas',
    loadChildren: () => import('./communes/communes.routes').then(m => m.CommunesRoutes),
  },
  {
    path: 'barrios',
    loadChildren: () => import('./neighborhoods/neighborhoods.routes').then(m => m.NeighborhoodsRoutes),
  },
];