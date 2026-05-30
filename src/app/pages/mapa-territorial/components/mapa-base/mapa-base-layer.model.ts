import * as L from 'leaflet';

export interface MapaBaseLayer {
  id: string;
  label: string;
  emoji: string;
  previewGradient: string;
  build: () => L.TileLayer;
}
