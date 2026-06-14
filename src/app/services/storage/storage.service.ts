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
    } catch {
      return this.fallback.get(key) ?? null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      this.fallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      this.fallback.delete(key);
    }
  }

  getObject<T = unknown>(key: string): T | null {
    const raw = this.getItem(key);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setObject<T = unknown>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // No se lanza error para no romper la app si falla el storage.
    }
  }
}
