import { Injectable } from '@angular/core';
import { IStorageService } from './storage.service.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService implements IStorageService {
  private readonly fallback = new Map<string, string>();

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return this.fallback.get(key) ?? null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      this.fallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.fallback.delete(key);
    }
  }

  getObject<T = any>(key: string): T | null {
    const raw = this.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      return null;
    }
  }

  setObject(key: string, value: any): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Se ignora para no romper la aplicación si el valor no se puede serializar
    }
  }
}
