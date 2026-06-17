import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, switchMap, timer, map, Subject, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Official } from '../../../models/official.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfficialsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/officials`;
  private trackingBase = `${environment.apiUrl}/api/officials/tracking`;
  
  private socket: Socket | null = null;
  private tracking$: Observable<Official[]> | null = null;
  private trackingSubject = new Subject<Official[]>();
  private officialsCache: Map<number, Official> = new Map(); // Cache para fusionar datos

  /**
   * Obtiene la lista inicial de officials vía HTTP
   */
  startPolling(intervalMs = 10_000): Observable<Official[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<Official[]>(this.base)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /**
   * Obtiene officials una sola vez vía HTTP
   */
  getOfficials(): Observable<Official[]> {
    return this.http.get<Official[]>(this.base);
  }

  /**
   * Inicia el rastreo de funcionarios via Socket.IO
   * @param ids - Array de IDs de funcionarios a rastrear
   */
  startTracking(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.trackingBase}/start`, { ids });
  }

  /**
   * Detiene el rastreo de funcionarios (todos o específicos)
   * @param ids - Array de IDs (opcional). Si se omite, detiene todos.
   */
  stopTracking(ids?: number[]): Observable<void> {
    return this.http.post<void>(`${this.trackingBase}/stop`, ids ? { ids } : {});
  }

  /**
   * Conecta a Socket.IO y retorna un observable que emite eventos 'official_tracking'
   * Fusiona datos de ubicación con el cache de officials para mantener info completa
   */
  connectSocketIO(): Observable<Official[]> {
    if (this.tracking$) return this.tracking$;

    this.tracking$ = new Observable<Official[]>((observer) => {
      if (!this.socket) {
        this.socket = io(environment.apiUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: Infinity,
        });

        this.socket.on('connect', () => {
          console.log('[OfficialsService] Socket.IO connected');
        });

        this.socket.on('disconnect', () => {
          console.log('[OfficialsService] Socket.IO disconnected');
        });

        this.socket.on('official_tracking', (payload: any) => {
          console.debug('[OfficialsService] official_tracking event:', payload);
          const trackingData = payload?.officials || [];

          // Fusionar datos de Socket.IO con cache
          const merged: Official[] = trackingData.map((update: any) => {
            const cached = this.officialsCache.get(update.id_official);
            return {
              ...cached, // Mantener datos completos del cache (name, photo_url, etc.)
              id_official: update.id_official,
              latitude: update.latitude,
              longitude: update.longitude,
              last_latitude: update.latitude,
              last_longitude: update.longitude,
              last_gps_update: update.last_gps_update,
              gps_active: cached?.gps_active ?? true,
              status: cached?.status ?? 'unknown',
            } as Official;
          });

          this.trackingSubject.next(merged);
          observer.next(merged);
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('[OfficialsService] Socket.IO connect error:', error);
          observer.error(error);
        });
      }

      return () => {
        // No desconectar socket aquí para mantenerlo vivo mientras haya suscriptores
      };
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    return this.tracking$;
  }

  /**
   * Inicializa el cache de officials con datos completos
   * @param officials - Array de officials con información completa (name, photo_url, etc.)
   */
  initializeCache(officials: Official[]): void {
    this.officialsCache.clear();
    officials.forEach((official) => {
      this.officialsCache.set(official.id_official, official);
    });
    console.log('[OfficialsService] Cache initialized with', officials.length, 'officials');
  }

  /**
   * Desconecta Socket.IO (opcional; normalmente se mantiene conexión)
   */
  disconnectSocketIO() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.tracking$ = null;
    }
  }

  getByEntity(entityId: number) {
    return this.http.get<Official[]>(`${this.base}/search?id_entity=${entityId}`);
  }
}