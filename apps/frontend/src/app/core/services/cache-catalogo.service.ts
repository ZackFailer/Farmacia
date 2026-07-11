import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';

const PATOLOGIAS_KEY = 'apoPharma_cache_patologias';
const NECESIDADES_KEY = 'apoPharma_cache_necesidades';
const PATOLOGIAS_TS_KEY = 'apoPharma_cache_patologias_ts';
const NECESIDADES_TS_KEY = 'apoPharma_cache_necesidades_ts';
const CACHE_TTL_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CacheCatalogoService {
  private readonly pacientesService = inject(PacientesService);

  async getPatologias(): Promise<Patologia[]> {
    const cached = this.getFromStorage<Patologia>(PATOLOGIAS_KEY, PATOLOGIAS_TS_KEY);
    if (cached) return cached;

    try {
      const patologias = await firstValueFrom(this.pacientesService.getPatologias());
      this.saveToStorage(PATOLOGIAS_KEY, PATOLOGIAS_TS_KEY, patologias);
      return patologias;
    } catch {
      const fallback = this.getFromStorage<Patologia>(PATOLOGIAS_KEY, PATOLOGIAS_TS_KEY);
      return fallback ?? [];
    }
  }

  async getNecesidades(): Promise<Necesidad[]> {
    const cached = this.getFromStorage<Necesidad>(NECESIDADES_KEY, NECESIDADES_TS_KEY);
    if (cached) return cached;

    try {
      const necesidades = await firstValueFrom(this.pacientesService.getNecesidades());
      this.saveToStorage(NECESIDADES_KEY, NECESIDADES_TS_KEY, necesidades);
      return necesidades;
    } catch {
      const fallback = this.getFromStorage<Necesidad>(NECESIDADES_KEY, NECESIDADES_TS_KEY);
      return fallback ?? [];
    }
  }

  private getFromStorage<T>(dataKey: string, tsKey: string): T[] | null {
    try {
      const raw = localStorage.getItem(dataKey);
      const ts = localStorage.getItem(tsKey);
      if (!raw || !ts) return null;
      const age = Date.now() - Number(ts);
      if (age > CACHE_TTL_MS) return null;
      return JSON.parse(raw) as T[];
    } catch {
      return null;
    }
  }

  private saveToStorage(dataKey: string, tsKey: string, data: unknown): void {
    try {
      localStorage.setItem(dataKey, JSON.stringify(data));
      localStorage.setItem(tsKey, String(Date.now()));
    } catch {
      console.warn('CacheCatalogoService: localStorage unavailable.');
    }
  }
}
