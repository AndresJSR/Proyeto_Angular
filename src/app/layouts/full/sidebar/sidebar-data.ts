import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Dashboard',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:atom-line-duotone',
    route: '/dashboard',
  },
  {
    navCap: 'Mapa Territorial',
  },
  {
    displayName: 'Mapa',
    iconName: 'solar:map-line-duotone',
    route: '/mapa',
    children: [
      {
        displayName: 'Ver Mapa',
        iconName: 'solar:map-pin-line-duotone',
        route: '/mapa/ver',
      },
      {
        displayName: 'Demarcación',
        iconName: 'solar:pen-new-square-line-duotone',
        route: '/mapa/demarcacion',
      },
      {
        displayName: 'Seguimiento',
        iconName: 'solar:user-check-line-duotone',
        route: '/mapa/seguimiento',
      },
      {
        displayName: 'Crear Anotación',
        iconName: 'solar:edit-square-line-duotone',
        route: '/mapa/anotar',
      },
      {
        displayName: 'Filtros',
        iconName: 'solar:funnel-line-duotone',
        route: '/mapa/filtros',
      },
    ],
  },
];
