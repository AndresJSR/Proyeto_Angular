import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

interface MapaHomeOption {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-mapa-home',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, TablerIconsModule],
  templateUrl: './mapa-home.component.html',
  styles: [
    '.mapa-home-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }',
    '.mapa-home-card { display: block; text-decoration: none; color: inherit; transition: transform .18s ease, box-shadow .18s ease; }',
    '.mapa-home-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,.12); }',
    '.mapa-home-card mat-card-content { display: flex; flex-direction: column; gap: 1rem; min-height: 220px; }',
    '.mapa-home-card .icon-wrapper { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 16px; background: rgba(25,118,210,.08); }',
    '.mapa-home-card h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }',
    '.mapa-home-card p { margin: 0; color: rgba(0,0,0,.7); }'
  ]
})
export class MapaHomeComponent {
  options: MapaHomeOption[] = [
    {
      title: 'Ver Mapa',
      description: 'Visualiza anotaciones en el mapa territorial',
      icon: 'solar:map-pin-line-duotone',
      route: '/mapa/ver',
    },
    {
      title: 'Demarcación',
      description: 'Demarcar y editar polígonos de barrios',
      icon: 'solar:pen-new-square-line-duotone',
      route: '/mapa/demarcacion',
    },
    {
      title: 'Seguimiento',
      description: 'Ver ubicación en tiempo real de funcionarios',
      icon: 'solar:user-check-line-duotone',
      route: '/mapa/seguimiento',
    },
    {
      title: 'Crear Anotación',
      description: 'Registrar una nueva anotación en el mapa',
      icon: 'solar:edit-square-line-duotone',
      route: '/mapa/anotar',
    },
    {
      title: 'Filtros',
      description: 'Filtrar anotaciones por categoría y subcategoría',
      icon: 'solar:funnel-line-duotone',
      route: '/mapa/filtros',
    },
  ];
}
