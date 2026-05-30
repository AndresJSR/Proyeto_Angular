import { Injectable } from '@angular/core';
import { MapaHomeOption } from './mapa-home-option.model';

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
      },
      {
        title: 'Demarcación',
        description: 'Dibuja y edita polígonos para demarcar barrios en el territorio.',
        icon: 'polygon',
        route: '/mapa/demarcacion',
        accent: 'secondary',
        tag: 'Edición',
      },
      {
        title: 'Seguimiento',
        description: 'Monitorea la ubicación en tiempo real de funcionarios activos.',
        icon: 'user-check',
        route: '/mapa/seguimiento',
        accent: 'tertiary',
        tag: 'Tiempo real',
      },
      {
        title: 'Crear Anotación',
        description: 'Registra un nuevo punto de interés o novedad en el mapa.',
        icon: 'map-plus',
        route: '/mapa/anotar',
        accent: 'error',
        tag: 'Nuevo',
      },
      {
        title: 'Filtros',
        description: 'Filtra y segmenta anotaciones por categoría o subcategoría.',
        icon: 'adjustments-horizontal',
        route: '/mapa/filtros',
        accent: 'surface',
        tag: 'Filtrar',
      },
    ];
  }
}