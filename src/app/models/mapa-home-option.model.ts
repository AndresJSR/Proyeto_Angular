export interface MapaHomeOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface';
  tag: string;
  features: string[];
}
