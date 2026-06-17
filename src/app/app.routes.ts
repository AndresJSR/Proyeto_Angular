import { Routes } from '@angular/router';

import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NoAuthenticatedGuard } from './guards/no-authenticated.guard';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivateChild: [AuthenticatedGuard],
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
          import('./pages/mapa-territorial/mapa-territorial.routes').then(
            (m) => m.MapaTerritorialRoutes,
          ),
      },
      {
        path: 'cuenta',
        loadChildren: () =>
          import('./pages/cuenta/cuenta.routes').then((m) => m.CuentaRoutes),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./pages/reportes-page/reportes.routes').then(
            (m) => m.ReportesRoutes,
          ),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    canActivateChild: [NoAuthenticatedGuard],
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/login',
  },
];
