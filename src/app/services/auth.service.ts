import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential,
} from '@angular/fire/auth';

import { User } from '../models/user';
import { AuthProvider } from '../models/auth/auth-provider.enum';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private firebaseAuth: Auth,
    private storage: StorageService,
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Carga el usuario guardado en el navegador.
   * Esto evita que se pierda la información básica al recargar la página.
   */
  private loadUserFromStorage(): void {
    const storedUser = this.storage.getObject<User>(this.storageKey);

    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  /**
   * CU-07
   * Inicia sesión con el proveedor OAuth seleccionado.
   */
  loginWithOAuth(provider: AuthProvider): Observable<User | null> {
    const firebaseProvider = this.getFirebaseProvider(provider);

    return from(signInWithPopup(this.firebaseAuth, firebaseProvider)).pipe(
      map((credential: UserCredential) =>
        this.mapFirebaseUserToUser(credential, provider),
      ),
      tap((user: User) => this.setUser(user)),
      catchError((error) => {
        console.error('Error al iniciar sesión con OAuth:', error);
        this.clearUser();
        return of(null);
      }),
    );
  }

  /**
   * CU-08
   * Cierra sesión en Firebase y limpia la sesión local.
   */
  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth)).pipe(
      tap(() => this.clearUser()),
      catchError((error) => {
        console.error('Error al cerrar sesión:', error);
        this.clearUser();
        return of(void 0);
      }),
    );
  }

  /**
   * Retorna el usuario actual como observable.
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Retorna el usuario actual como valor directo.
   * Útil para guards, sidebar y header.
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Indica si hay usuario autenticado en el frontend.
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Guarda el usuario actual en memoria y storage.
   */
  setUser(user: User | null): void {
    this.currentUserSubject.next(user);

    if (!user) {
      this.storage.removeItem(this.storageKey);
      return;
    }

    const userToStore: User = { ...user };
    delete userToStore.password;

    this.storage.setObject(this.storageKey, userToStore);
  }

  /**
   * Limpia la sesión local del frontend.
   */
  clearUser(): void {
    this.currentUserSubject.next(null);
    this.storage.removeItem(this.storageKey);
  }

  /**
   * Devuelve el rol actual.
   */
  getCurrentUserRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  /**
   * CU-07 - Flujo alternativo 4a.
   * Si no hay rol asignado, luego se puede redirigir a completar perfil.
   */
  requiresProfileCompletion(user: User | null): boolean {
    return !user || !user.role;
  }

  /**
   * Selecciona el proveedor de Firebase según el enum recibido.
   */
  private getFirebaseProvider(provider: AuthProvider) {
    switch (provider) {
      case AuthProvider.GOOGLE:
        return new GoogleAuthProvider();

      case AuthProvider.GITHUB:
        return new GithubAuthProvider();

      case AuthProvider.MICROSOFT:
        return new OAuthProvider('microsoft.com');

      default:
        throw new Error('Proveedor OAuth no soportado');
    }
  }

  /**
   * Convierte el usuario de Firebase al modelo User del proyecto.
   *
   * Nota:
   * Firebase autentica al usuario, pero el rol real del sistema
   * debería venir luego desde el backend o desde una colección de usuarios.
   */
  private mapFirebaseUserToUser(
    credential: UserCredential,
    provider: AuthProvider,
  ): User {
    const firebaseUser = credential.user;

    return {
      id: firebaseUser.uid as unknown as number,
      name: firebaseUser.displayName ?? '',
      email: firebaseUser.email ?? '',
      phone: firebaseUser.phoneNumber ?? '',
      provider,
      status: 'active',

      /**
       * Por ahora queda vacío.
       * Luego se debe reemplazar por el rol real:
       * ADMIN, FUNCIONARIO o CIUDADANO.
       */
      role: undefined,
    };
  }
}
