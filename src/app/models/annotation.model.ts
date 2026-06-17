export interface Annotation {
  id_annotation: number;
  id_neighborhood: number;
  id_citizen: number;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  registration_date: string;
  neighborhood_name?: string;
  commune_name?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface NeighborhoodSearchResult {
  id_neighborhood: number;
  name: string;
  commune_name: string;
  id_commune: number;
}
