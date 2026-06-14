import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { AuthProvider } from '../models/auth-provider.enum';
import { AuthUser } from '../models/auth-user';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'authUser';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.storage.getObject<AuthUser>(this.storageKey),
  );

  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly storage: StorageService) {}

  loginWithProvider(provider: AuthProvider): Observable<AuthUser> {
    const user = this.buildDemoUser(provider);
    this.setUser(user);

    return of(user);
  }

  logout(): Observable<void> {
    this.clearUser();

    return of(void 0);
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$;
  }

  getCurrentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  setUser(user: AuthUser | null): void {
    this.currentUserSubject.next(user);

    if (user) {
      this.storage.setObject<AuthUser>(this.storageKey, user);
      return;
    }

    this.storage.removeItem(this.storageKey);
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    this.storage.removeItem(this.storageKey);
  }

  private buildDemoUser(provider: AuthProvider): AuthUser {
    const users: Record<AuthProvider, AuthUser> = {
      [AuthProvider.GOOGLE]: {
        id: 'google-demo-user',
        name: 'Usuario Google',
        email: 'usuario.google@demo.com',
        provider: AuthProvider.GOOGLE,
      },
      [AuthProvider.MICROSOFT]: {
        id: 'microsoft-demo-user',
        name: 'Usuario Microsoft',
        email: 'usuario.microsoft@demo.com',
        provider: AuthProvider.MICROSOFT,
      },
      [AuthProvider.GITHUB]: {
        id: 'github-demo-user',
        name: 'Usuario GitHub',
        email: 'usuario.github@demo.com',
        provider: AuthProvider.GITHUB,
      },
    };

    return users[provider];
  }
}
