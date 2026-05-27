export interface Official {
  id_official: number;
  id_entity: number;
  name: string;
  last_latitude: number;
  last_longitude: number;
  last_gps_update: string;
  gps_active: boolean;
  status: string;
}