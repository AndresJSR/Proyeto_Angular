import { Routes } from '@angular/router';

import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { NoAuthenticatedGuard } from '../../guards/no-authenticated.guard';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: AppSideLoginComponent,
        canActivate: [NoAuthenticatedGuard],
        title: 'Iniciar sesión',
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
        title: 'Completar perfil',
      },
      {
        path: 'complete-profile',
        redirectTo: 'register',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];
