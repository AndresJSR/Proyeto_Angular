import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

const MESSAGES: Record<number, string> = {
  0:   'Sin conexión con el servidor. Verifica tu red.',
  400: 'Solicitud incorrecta. Revisa los datos ingresados.',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Conflicto: el registro ya existe.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  500: 'Error interno del servidor. Intenta más tarde.',
  502: 'El servidor no está disponible en este momento.',
  503: 'Servicio temporalmente fuera de línea.',
};

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private snack = inject(MatSnackBar);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = MESSAGES[error.status] ?? `Error inesperado (${error.status}).`;
        this.snack.open(message, 'Cerrar', {
          duration:            5000,
          horizontalPosition:  'right',
          verticalPosition:    'bottom',
          panelClass:          ['snack-error'],
        });
        return throwError(() => error);
      })
    );
  }
}
