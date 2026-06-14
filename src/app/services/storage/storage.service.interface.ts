export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getObject<T = unknown>(key: string): T | null;
  setObject<T = unknown>(key: string, value: T): void;
}
