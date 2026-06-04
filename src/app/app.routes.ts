import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'mapa',
        loadChildren: () =>
          import('./pages/mapa-territorial/mapa-territorial.routes')
            .then((m) => m.MapaTerritorialRoutes),
      },
      // ✅ AGREGAR ESTO
      {
        path: 'gestion-institucional',
        loadChildren: () =>
          import('./pages/gestion-institucional/gestion-institucional.routes')
            .then(m => m.GestionInstitucionalRoutes),
      },
      // ✅ AGREGAR ESTO
      {
        path: 'gestion-territorial',
        loadChildren: () =>
          import('./pages/gestion-territorial/gestion-territorial.routes')
            .then(m => m.GestionTerritorialRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];