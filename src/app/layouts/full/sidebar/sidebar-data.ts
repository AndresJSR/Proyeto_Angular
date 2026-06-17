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
    displayName: 'Mapa Territorial',
    iconName: 'solar:map-pin-line-duotone',
    route: '/mapa',
  },
  {
    navCap: 'Gestión Institucional',
  },
  {
    displayName: 'Entidades',
    iconName: 'solar:building-3-line-duotone',
    route: '/gestion-institucional/entidades',
  },
  {
    displayName: 'Funcionarios',
    iconName: 'solar:user-square-line-duotone',
    route: '/gestion-institucional/funcionarios',
  },
  {
    displayName: 'Ciudadanos',
    iconName: 'solar:users-line-duotone',
    route: '/gestion-institucional/ciudadanos',
  },
  {
    displayName: 'Categorías',
    iconName: 'solar:tag-line-duotone',
    route: '/gestion-institucional/categorias',
  },
  {
    navCap: 'Gestión Territorial',
  },
  {
    displayName: 'Comunas',
    iconName: 'solar:location-pin-line-duotone',
    route: '/gestion-territorial/comunas',
  },
  {
    displayName: 'Barrios',
    iconName: 'solar:home-city-line-duotone',
    route: '/gestion-territorial/barrios',
  },
  {
    navCap: 'Reportes Inteligentes',
  },
  {
    displayName: 'Consultas',
    iconName: 'solar:search-line-duotone',
    route: '/reportes/consultas',
  },
  {
    displayName: 'Estadísticas',
    iconName: 'solar:chart-bar-line-duotone',
    route: '/reportes/estadisticas',
  },
  {
    displayName: 'Gráficas',
    iconName: 'solar:chart-pie-line-duotone',
    route: '/reportes/graficas',
  },
  {
    navCap: 'Cuenta',
  },
  {
    displayName: 'Perfil',
    iconName: 'solar:user-circle-line-duotone',
    route: '/cuenta/perfil',
  },
  {
    displayName: 'Configuración',
    iconName: 'solar:settings-line-duotone',
    route: '/cuenta/configuracion',
  },
  {
    displayName: 'Cerrar sesión',
    iconName: 'solar:logout-1-line-duotone',
    route: '/cuenta/logout',
  },
];