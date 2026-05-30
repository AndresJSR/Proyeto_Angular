export interface Official {
  id_official: number;
  id_entity: number;
  name: string;
  entity_name?: string;
  address?: string;
  photo_url?: string;
  last_latitude: number;
  last_longitude: number;
  last_gps_update: string;
  gps_active: boolean;
  status: string;
}