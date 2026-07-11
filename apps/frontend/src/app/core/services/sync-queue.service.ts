import { Injectable, signal, inject } from '@angular/core';
import { ConnectivityService } from './connectivity.service';
import { PendingCarpaStore } from './pending-carpa-store.service';
import { API_BASE_URL } from './api.constants';

export interface SyncResult {
  synced: number;
  failed: number;
  total: number;
  timestamp: Date;
}

export enum SyncOperationType {
  CREATE_CARPA = 'CREATE_CARPA',
  UPDATE_CARPA = 'UPDATE_CARPA',
  DELETE_CARPA = 'DELETE_CARPA',
  CREATE_PATIENT = 'CREATE_PATIENT',
  UPDATE_PATIENT = 'UPDATE_PATIENT',
  DELETE_PATIENT = 'DELETE_PATIENT',
  ADD_MEMBER_CARPA = 'ADD_MEMBER_CARPA',
  MARK_NEED_SUPLIDA = 'MARK_NEED_SUPLIDA',
}

export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body: unknown;
  createdAt: string;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'failed';
  errorMessage?: string;
  metadata?: {
    descripcion?: string;
    codigoCarpa?: string;
    pacienteNombre?: string;
    tempId?: number;
    dependsOnTempId?: number;
    tempCodigo?: string;
  };
}

const STORAGE_KEY = 'apoPharma_sync_queue';

function generateId(): string {
  return crypto.randomUUID();
}

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private readonly connectivity = inject(ConnectivityService);
  private readonly pendingCarpaStore = inject(PendingCarpaStore);
  private readonly count = signal<number>(0);
  private readonly failedCount = signal<number>(0);

  readonly pendingCount = this.count.asReadonly();
  readonly failedItemsCount = this.failedCount.asReadonly();
  readonly lastSyncResult = signal<SyncResult | null>(null);

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.updateCounts();
    window.addEventListener('online', () => {
      this.processQueue();
    });
    this.startPeriodicRefresh();
  }

  enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries' | 'maxRetries' | 'status'>): void {
    const queue = this.getAll();
    const newItem: SyncQueueItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      retries: 0,
      maxRetries: 5,
      status: 'pending',
    };
    queue.push(newItem);
    this.saveAll(queue);
    this.updateCounts();
  }

  getAll(): SyncQueueItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return parsed as SyncQueueItem[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  getPending(): SyncQueueItem[] {
    return this.getAll().filter((i) => i.status === 'pending');
  }

  getFailed(): SyncQueueItem[] {
    return this.getAll().filter((i) => i.status === 'failed');
  }

  remove(id: string): void {
    const queue = this.getAll().filter((i) => i.id !== id);
    this.saveAll(queue);
    this.updateCounts();
  }

  markFailed(id: string, errorMessage: string): void {
    const queue = this.getAll();
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.status = 'failed';
      item.errorMessage = errorMessage;
      this.saveAll(queue);
      this.updateCounts();
    }
  }

  async processQueue(): Promise<{ synced: number; failed: number }> {
    return this.processItems(this.getPending());
  }

  async retryFailed(id: string): Promise<boolean> {
    const item = this.getAll().find((i) => i.id === id);
    if (!item) return false;
    item.retries = 0;
    item.status = 'pending';
    item.errorMessage = undefined;
    this.saveAll(this.getAll());
    this.updateCounts();
    const result = await this.processItems([item]);
    return result.synced > 0;
  }

  private async processItems(items: SyncQueueItem[]): Promise<{ synced: number; failed: number }> {
    if (!this.connectivity.isOnline()) {
      return { synced: 0, failed: 0 };
    }

    if (items.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const total = items.length;

    const tempIdMap = new Map<number, number>();

    for (const item of items) {
      if (item.retries >= item.maxRetries) {
        this.markFailed(item.id, 'Excedió el máximo de reintentos.');
        failed++;
        continue;
      }

      try {
        const body = this.resolveTempIds(item.body as Record<string, unknown> | null, tempIdMap);
        const endpoint = this.resolveTempIdsInEndpoint(item.endpoint, tempIdMap);

        const token = localStorage.getItem('apoPharma_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: item.method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          if (item.type === SyncOperationType.CREATE_PATIENT || item.type === SyncOperationType.CREATE_CARPA) {
            const result = await response.json() as { id?: number; codigoCarpa?: string };
            if (result.id != null && item.metadata?.tempId != null) {
              tempIdMap.set(item.metadata.tempId, result.id);
              const queue = this.getAll();
              let changed = false;
              for (const q of queue) {
                if (q.metadata?.dependsOnTempId === item.metadata.tempId && q.status === 'pending') {
                  const body = q.body as Record<string, unknown> | null;
                  if (body && typeof body['pacienteId'] === 'number' && body['pacienteId'] < 0) {
                    body['pacienteId'] = result.id;
                    changed = true;
                  }
                }
              }
              if (changed) {
                this.saveAll(queue);
                // Also update local items array for subsequent loop iterations
                for (const processItem of items) {
                  if (processItem.metadata?.dependsOnTempId === item.metadata.tempId && processItem.status === 'pending') {
                    const body = processItem.body as Record<string, unknown> | null;
                    if (body && typeof body['pacienteId'] === 'number' && body['pacienteId'] < 0) {
                      body['pacienteId'] = result.id;
                    }
                  }
                }
              }
            }
            // CARPA-specific: replace temp codigo in dependent endpoints
            if (item.type === SyncOperationType.CREATE_CARPA && item.metadata?.tempCodigo && result.codigoCarpa) {
              const tempCodigo = item.metadata.tempCodigo;
              const realCodigo = result.codigoCarpa;
              if (tempCodigo !== realCodigo) {
                const queue = this.getAll();
                let changed = false;
                for (const q of queue) {
                  if (q.status === 'pending' && q.endpoint.includes(tempCodigo)) {
                    q.endpoint = q.endpoint.replace(tempCodigo, realCodigo);
                    changed = true;
                  }
                }
                if (changed) {
                  this.saveAll(queue);
                  // Also update local items array so subsequent loop iterations use the real endpoint
                  for (const processItem of items) {
                    if (processItem.status === 'pending' && processItem.endpoint.includes(tempCodigo)) {
                      processItem.endpoint = processItem.endpoint.replace(tempCodigo, realCodigo);
                    }
                  }
                }
              }
              this.pendingCarpaStore.saveCodigoMapping(tempCodigo, realCodigo);
              this.pendingCarpaStore.remove(tempCodigo);
            }
          }
          this.remove(item.id);
          synced++;
        } else if (response.status === 409) {
          this.remove(item.id);
          synced++;
        } else if (response.status >= 400 && response.status < 500) {
          this.markFailed(item.id, `HTTP ${response.status}: ${response.statusText}`);
          failed++;
        } else {
          this.incrementRetry(item);
          failed++;
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          this.markFailed(item.id, 'Tiempo de espera agotado (30s).');
        } else {
          this.incrementRetry(item);
        }
        failed++;
      }
    }

    this.updateCounts();
    this.pruneStale();
    this.lastSyncResult.set({ synced, failed, total, timestamp: new Date() });
    return { synced, failed };
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.updateCounts();
  }

  private incrementRetry(item: SyncQueueItem): void {
    item.retries++;
    const queue = this.getAll();
    const stored = queue.find((i) => i.id === item.id);
    if (stored) stored.retries = item.retries;
    this.saveAll(queue);
  }

  private resolveTempIds(body: Record<string, unknown> | null, tempIdMap: Map<number, number>): Record<string, unknown> | null {
    if (!body) return body;
    const resolved = { ...body };
    if (typeof resolved['pacienteId'] === 'number' && resolved['pacienteId'] < 0) {
      const realId = tempIdMap.get(resolved['pacienteId'] as number);
      if (realId != null) resolved['pacienteId'] = realId;
    }
    return resolved;
  }

  private resolveTempIdsInEndpoint(endpoint: string, tempIdMap: Map<number, number>): string {
    return endpoint.replace(/\{\{temp_([^}]+)\}\}/g, (_, key) => {
      const tempId = parseInt(key, 10);
      const realId = tempIdMap.get(tempId);
      return realId != null ? String(realId) : key;
    });
  }

  private saveAll(items: SyncQueueItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err: unknown) {
      console.error('SyncQueueService: Error al guardar en localStorage.');
      if (err instanceof DOMException && (
        err.name === 'QuotaExceededError' || err.code === 22
      )) {
        alert('El almacenamiento local está lleno. No se pueden guardar más registros pendientes. Libere espacio o contacte al administrador.');
      } else {
        console.error('SyncQueueService: localStorage no disponible.', err);
      }
    }
  }

  private updateCounts(): void {
    const all = this.getAll();
    this.count.set(all.filter((i) => i.status === 'pending').length);
    this.failedCount.set(all.filter((i) => i.status === 'failed').length);
  }

  private startPeriodicRefresh(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => {
      if (this.count() > 0 && this.connectivity.isOnline()) {
        this.processQueue();
      }
    }, 30000);
  }

  private pruneStale(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const queue = this.getAll().filter((i) => new Date(i.createdAt) > sevenDaysAgo || i.status === 'pending');
    this.saveAll(queue);
  }
}
