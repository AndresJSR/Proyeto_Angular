import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

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
      error: () => {
        this.loadingProvider = null;
        this.error = 'No se pudo iniciar sesión. Intenta nuevamente.';
      },
    });
  }

  isLoading(provider: AuthProvider): boolean {
    return this.loadingProvider === provider;
  }
}
