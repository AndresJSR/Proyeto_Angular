import { Routes } from '@angular/router';

import { ReportesPageComponent } from './reportes-page.component';

export const ReportesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'consultas',
    pathMatch: 'full',
  },
  {
    path: 'consultas',
    component: ReportesPageComponent,
  },
  {
    path: 'graficas',
    component: ReportesPageComponent,
  },
  {
    path: 'estadisticas',
    component: ReportesPageComponent,
  },
];
