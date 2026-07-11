import { Injectable, signal } from '@angular/core';

export interface PendingCarpa {
  tempCodigo: string;
  ubicacion?: string;
  createdAt: string;
}

type CodigoMapping = Record<string, string>;

const STORAGE_KEY = 'apoPharma_pending_carpas';
const CODIGO_MAP_KEY = 'apoPharma_codigo_map';

@Injectable({ providedIn: 'root' })
export class PendingCarpaStore {
  private readonly _count = signal(0);
  readonly count = this._count.asReadonly();

  constructor() {
    this.updateCount();
  }

  getAll(): PendingCarpa[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return parsed as PendingCarpa[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  getByCodigo(codigo: string): PendingCarpa | undefined {
    return this.getAll().find((c) => c.tempCodigo === codigo);
  }

  add(carpa: PendingCarpa): void {
    const list = this.getAll();
    list.push(carpa);
    this.saveAll(list);
  }

  remove(codigo: string): void {
    const list = this.getAll().filter((c) => c.tempCodigo !== codigo);
    this.saveAll(list);
  }

  saveCodigoMapping(tempCodigo: string, realCodigo: string): void {
    const map = this.getCodigoMappings();
    map[tempCodigo] = realCodigo;
    try {
      localStorage.setItem(CODIGO_MAP_KEY, JSON.stringify(map));
    } catch {
      console.warn('PendingCarpaStore: localStorage unavailable for codigo map.');
    }
  }

  getRealCodigo(tempCodigo: string): string | undefined {
    return this.getCodigoMappings()[tempCodigo];
  }

  getCodigoMappings(): CodigoMapping {
    try {
      const raw = localStorage.getItem(CODIGO_MAP_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as CodigoMapping;
    } catch {
      localStorage.removeItem(CODIGO_MAP_KEY);
      return {};
    }
  }

  private saveAll(items: PendingCarpa[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      console.warn('PendingCarpaStore: localStorage unavailable.');
    }
    this.updateCount();
  }

  private updateCount(): void {
    this._count.set(this.getAll().length);
  }
}
