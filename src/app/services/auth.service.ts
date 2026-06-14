import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';

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

  constructor(
    private readonly storage: StorageService,
    private readonly firebaseAuth: Auth,
  ) {}

  loginWithProvider(provider: AuthProvider): Observable<AuthUser> {
    const firebaseProvider = this.getFirebaseProvider(provider);

    return from(signInWithPopup(this.firebaseAuth, firebaseProvider)).pipe(
      map((credential) => {
        const user = this.mapFirebaseUserToAuthUser(credential.user, provider);

        this.setUser(user);

        return user;
      }),
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth)).pipe(
      map(() => {
        this.clearUser();
      }),
    );
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

  private getFirebaseProvider(provider: AuthProvider) {
    switch (provider) {
      case AuthProvider.GOOGLE:
        return new GoogleAuthProvider();

      case AuthProvider.GITHUB:
        return new GithubAuthProvider();

      case AuthProvider.MICROSOFT:
        throw new Error('Microsoft todavía no está configurado en Firebase.');

      default:
        throw new Error('Proveedor de autenticación no soportado.');
    }
  }

  private mapFirebaseUserToAuthUser(
    firebaseUser: User,
    provider: AuthProvider,
  ): AuthUser {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName ?? 'Usuario',
      email: firebaseUser.email ?? '',
      provider,
      avatarUrl: firebaseUser.photoURL ?? undefined,
    };
  }
}
