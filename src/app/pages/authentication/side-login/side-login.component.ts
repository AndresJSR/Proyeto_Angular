import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { FirebaseError } from 'firebase/app';

import { MaterialModule } from 'src/app/material.module';
import { AuthProvider } from '../../../models/auth-provider.enum';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  readonly authProvider = AuthProvider;

  loadingProvider: AuthProvider | null = null;
  error: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  loginWithProvider(provider: AuthProvider): void {
    this.error = null;
    this.loadingProvider = provider;

    this.authService.loginWithProvider(provider).subscribe({
      next: () => {
        this.loadingProvider = null;
        this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.loadingProvider = null;
        this.error = this.getLoginErrorMessage(error);
      },
    });
  }

  isLoading(provider: AuthProvider): boolean {
    return this.loadingProvider === provider;
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/popup-closed-by-user') {
        return 'Cerraste la ventana de inicio de sesión antes de finalizar.';
      }

      if (error.code === 'auth/account-exists-with-different-credential') {
        return 'Ya existe una cuenta con este correo usando otro proveedor.';
      }

      if (error.code === 'auth/unauthorized-domain') {
        return 'El dominio actual no está autorizado en Firebase Authentication.';
      }

      if (error.code === 'auth/popup-blocked') {
        return 'El navegador bloqueó la ventana emergente de inicio de sesión.';
      }
    }

    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
}
