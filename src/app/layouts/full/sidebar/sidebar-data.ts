import { NavItem } from './nav-item/nav-item';

export const templateNavItems: NavItem[] = [
  {
    navCap: 'Plantilla',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:atom-line-duotone',
    route: '/dashboard',
  },
  {
    navCap: 'Ui Components',
  },
  {
    displayName: 'Badge',
    iconName: 'solar:archive-minimalistic-line-duotone',
    route: '/ui-components/badge',
  },
  {
    displayName: 'Chips',
    iconName: 'solar:danger-circle-line-duotone',
    route: '/ui-components/chips',
  },
  {
    displayName: 'Lists',
    iconName: 'solar:bookmark-square-minimalistic-line-duotone',
    route: '/ui-components/lists',
  },
  {
    displayName: 'Menu',
    iconName: 'solar:file-text-line-duotone',
    route: '/ui-components/menu',
  },
  {
    displayName: 'Tooltips',
    iconName: 'solar:text-field-focus-line-duotone',
    route: '/ui-components/tooltips',
  },
  {
    navCap: 'Pages',
  },
  {
    displayName: 'Forms',
    iconName: 'solar:file-text-line-duotone',
    route: '/ui-components/forms',
  },
  {
    displayName: 'Tables',
    iconName: 'solar:tablet-line-duotone',
    route: '/ui-components/tables',
  },
  {
    navCap: 'Extra',
  },
  {
    displayName: 'Icons',
    iconName: 'solar:sticker-smile-circle-2-line-duotone',
    route: '/extra/icons',
  },
  {
    displayName: 'Sample Page',
    iconName: 'solar:planet-3-line-duotone',
    route: '/extra/sample-page',
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'solar:login-2-linear',
    route: 'authentication',
    children: [
      {
        displayName: 'Boxed Login',
        iconName: 'tabler:point',
        route: '/authentication/login',
      },
    ],
  },
  {
    displayName: 'Register',
    iconName: 'solar:user-plus-linear',
    route: 'authentication',
    children: [
      {
        displayName: 'Boxed Register',
        iconName: 'tabler:point',
        route: '/authentication/register',
      },
    ],
  },
];

export const templateNavChildren: NavItem[] = templateNavItems.filter(
  (item) => !!item.displayName
);

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
    displayName: 'Subcategorías',
    iconName: 'solar:layers-triple-line-duotone',
    route: '/gestion-institucional/subcategorias',
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
    displayName: 'Demarcación',
    iconName: 'solar:map-line-duotone',
    route: '/gestion-territorial/demarcacion',
  },
  {
    displayName: 'Mapa',
    iconName: 'solar:map-pin-line-duotone',
    route: '/gestion-territorial/mapa',
  },

  {
    navCap: 'Anotaciones',
  },
  {
    displayName: 'Crear',
    iconName: 'solar:edit-square-line-duotone',
    route: '/anotaciones/crear',
  },
  {
    displayName: 'Visualizar',
    iconName: 'solar:eye-bold-duotone',
    route: '/anotaciones/visualizar',
  },
  {
    displayName: 'Filtros',
    iconName: 'solar:funnel-line-duotone',
    route: '/anotaciones/filtros',
  },
  {
    displayName: 'Evidencias',
    iconName: 'solar:camera-line-duotone',
    route: '/anotaciones/evidencias',
  },

  {
    navCap: 'Monitoreo',
  },
  {
    displayName: 'Tiempo real',
    iconName: 'solar:clock-line-duotone',
    route: '/monitoreo/tiempo-real',
  },
  {
    displayName: 'Funcionarios',
    iconName: 'solar:user-check-line-duotone',
    route: '/monitoreo/funcionarios',
  },
  {
    displayName: 'Ubicaciones',
    iconName: 'solar:location-circle-line-duotone',
    route: '/monitoreo/ubicaciones',
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
    displayName: 'Logout',
    iconName: 'solar:logout-1-line-duotone',
    route: '/cuenta/logout',
  },
  {
    displayName: 'Plantilla',
    iconName: 'solar:layers-line-duotone',
    children: templateNavChildren,
  },
];
