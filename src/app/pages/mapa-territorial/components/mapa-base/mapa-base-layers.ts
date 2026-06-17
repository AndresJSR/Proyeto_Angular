import * as L from 'leaflet';
import { MapaBaseLayer } from '../../../../models/mapa-base-layer.model';

export const MAPA_BASE_LAYERS: MapaBaseLayer[] = [
  {
    id: 'voyager',
    label: 'Voyager',
    emoji: '🗺',
    previewGradient: 'linear-gradient(135deg,#e8f4fd,#b8d4e8,#7bacc4)',
    build: () => L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/">CartoDB</a>',
      maxZoom: 20,
    }),
  },
  {
    id: 'light',
    label: 'Claro',
    emoji: '☀️',
    previewGradient: 'linear-gradient(135deg,#f5f5f0,#e0e0d8,#c8c8bc)',
    build: () => L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/">CartoDB</a>',
      maxZoom: 20,
    }),
  },
  {
    id: 'dark',
    label: 'Oscuro',
    emoji: '🌙',
    previewGradient: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    build: () => L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/">CartoDB</a>',
      maxZoom: 20,
    }),
  },
  {
    id: 'satellite',
    label: 'Satélite',
    emoji: '🛰',
    previewGradient: 'linear-gradient(135deg,#2d5a27,#1a3a1a,#0a1f0a)',
    build: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 18,
    }),
  },
  {
    id: 'osm',
    label: 'Estándar',
    emoji: '🗾',
    previewGradient: 'linear-gradient(135deg,#d4e8b4,#a8c890,#7aaa6a)',
    build: () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }),
  },
  {
    id: 'topo',
    label: 'Topográfico',
    emoji: '⛰',
    previewGradient: 'linear-gradient(135deg,#c8daa0,#a0b870,#789050)',
    build: () => L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
    }),
  },
];
