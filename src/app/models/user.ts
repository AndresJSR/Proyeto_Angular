import { UserRole } from './auth/user-role.enum';
import { AuthProvider } from './auth/auth-provider.enum';

export interface User {
  id?: number;

  name?: string;
  email?: string;
  phone?: string;
  address?: string;

  role?: UserRole;
  status?: string;

  provider?: AuthProvider;

  id_entity?: number;

  latitude?: number;
  longitude?: number;

  last_latitude?: number;
  last_longitude?: number;
  last_gps_update?: string;
  gps_active?: boolean;

  password?: string;
}
