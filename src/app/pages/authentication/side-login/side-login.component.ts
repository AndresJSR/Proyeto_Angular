import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from 'src/app/material.module';
import { AuthService } from '../../../services/auth.service';
import { AuthProvider } from '../../../models/auth/auth-provider.enum';
import { User } from '../../../models/user';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  loading = false;
  loadingProvider: AuthProvider | null = null;
  error: string | null = null;

  readonly AuthProvider = AuthProvider;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  loginWithProvider(provider: AuthProvider): void {
    this.loading = true;
    this.loadingProvider = provider;
    this.error = null;

    this.authService.loginWithOAuth(provider).subscribe({
      next: (user) => {
        this.loading = false;
        this.loadingProvider = null;

        if (!user) {
          this.showLoginError();
          return;
        }

        this.redirectAfterLogin(user);
      },
      error: () => {
        this.loading = false;
        this.loadingProvider = null;
        this.showLoginError();
      },
    });
  }

  private redirectAfterLogin(user: User): void {
    /**
     * Cuando ya conectemos roles reales desde backend,
     * aquí se puede redirigir según ADMIN, FUNCIONARIO o CIUDADANO.
     *
     * Por ahora, si no tiene rol, lo mandamos al register
     * porque eso representa el flujo alternativo 4a:
     * "El usuario no está registrado → completar perfil".
     */
    if (this.authService.requiresProfileCompletion(user)) {
      this.router.navigate(['/authentication/register']);
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  private showLoginError(): void {
    this.error = 'No fue posible iniciar sesión. Intenta nuevamente.';

    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: this.error,
      confirmButtonText: 'Entendido',
    });
  }

  isLoadingProvider(provider: AuthProvider): boolean {
    return this.loading && this.loadingProvider === provider;
  }
}
