import { Injectable } from '@angular/core';
import { MapaHomeOption } from '../../../models/mapa-home-option.model';

@Injectable({ providedIn: 'root' })
export class MapaHomeService {
  getOptions(): MapaHomeOption[] {
    return [
      {
        title: 'Ver Mapa',
        description: 'Visualiza todas las anotaciones territoriales en el mapa interactivo.',
        icon: 'map-pin',
        route: '/mapa/ver',
        accent: 'primary',
        tag: 'Explorar',
        features: ['Capas de anotaciones', 'Navegación libre', 'Vista por barrio'],
      },
      {
        title: 'Demarcación',
        description: 'Dibuja y edita polígonos para demarcar barrios en el territorio.',
        icon: 'polygon',
        route: '/mapa/demarcacion',
        accent: 'secondary',
        tag: 'Edición',
        features: ['Polígonos editables', 'Asignación de barrios', 'Exportar zonas'],
      },
      {
        title: 'Seguimiento',
        description: 'Monitorea la ubicación en tiempo real de funcionarios activos.',
        icon: 'user-check',
        route: '/mapa/seguimiento',
        accent: 'tertiary',
        tag: 'Tiempo real',
        features: ['GPS en vivo', 'Historial de rutas', 'Estado de funcionarios'],
      },
      {
        title: 'Crear Anotación',
        description: 'Registra un nuevo punto de interés o novedad en el mapa.',
        icon: 'map-plus',
        route: '/mapa/anotar',
        accent: 'error',
        tag: 'Nuevo',
        features: ['Formulario guiado', 'Adjuntar evidencias', 'Categorización rápida'],
      },
      {
        title: 'Filtros',
        description: 'Filtra y segmenta anotaciones por categoría o subcategoría.',
        icon: 'adjustments-horizontal',
        route: '/mapa/filtros',
        accent: 'surface',
        tag: 'Filtrar',
        features: ['Por categoría', 'Rango de fechas', 'Buscar por zona'],
      },
    ];
  }
}
