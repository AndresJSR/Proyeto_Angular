import { AuthProvider } from './auth-provider.enum';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  provider?: AuthProvider;
  avatarUrl?: string;
}
