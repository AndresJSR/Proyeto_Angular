import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="nf-wrapper">
      <div class="nf-content">
        <p class="nf-code">404</p>
        <h1 class="nf-title">Página no encontrada</h1>
        <p class="nf-sub">La ruta que buscas no existe o fue movida.</p>
        <a routerLink="/dashboard" class="nf-btn">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .nf-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      font-family: inherit;
    }

    .nf-content {
      text-align: center;
      padding: 40px 24px;
    }

    .nf-code {
      font-size: 120px;
      font-weight: 900;
      line-height: 1;
      margin: 0 0 8px;
      color: #e2e8f0;
      letter-spacing: -4px;
    }

    .nf-title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px;
    }

    .nf-sub {
      font-size: 15px;
      color: #64748b;
      margin: 0 0 32px;
    }

    .nf-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: #2563eb;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s ease, transform 0.1s ease;

      &:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }
    }
  `],
})
export class NotFoundComponent {}
