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
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'mapa',
        loadChildren: () =>
          import('./pages/mapa-territorial/mapa-territorial.routes')
            .then(m => m.MapaTerritorialRoutes)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./pages/users/users.routes').then((m) => m.UserRoutes),
      },
      {
        path: 'gestion-institucional',
        children: [
          { path: '**', redirectTo: '/dashboard' }
        ]
      },
      {
        path: 'gestion-territorial',
        children: [
          {
            path: 'demarcacion',
            loadChildren: () =>
              import('./pages/mapa-territorial/mapa-territorial.routes')
                .then((m) => m.MapaTerritorialRoutes),
          },
          {
            path: 'mapa',
            loadChildren: () =>
              import('./pages/mapa-territorial/mapa-territorial.routes')
                .then((m) => m.MapaTerritorialRoutes),
          },
          { path: '**', redirectTo: '/dashboard' }
        ]
      },
      {
        path: 'anotaciones',
        children: [
          { path: '**', redirectTo: '/dashboard' }
        ]
      },
      {
        path: 'monitoreo',
        children: [
          { path: '**', redirectTo: '/dashboard' }
        ]
      },
      {
        path: 'reportes',
        children: [
          { path: '**', redirectTo: '/dashboard' }
        ]
      },
      {
        path: 'cuenta',
        children: [
          { path: '**', redirectTo: '/dashboard' }
        ]
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
