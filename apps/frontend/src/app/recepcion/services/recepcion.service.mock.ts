import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { RecepcionService } from './recepcion.service';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';

const MEDICAMENTOS: Medicamento[] = [
  { id: 1, nombre_generico: 'Paracetamol', nombre_comercial: 'Tempra', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, nombre_generico: 'Amoxicilina', nombre_comercial: undefined, presentacion: 'Suspensión', concentracion: 250, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 3, nombre_generico: 'Ibuprofeno', nombre_comercial: 'Advil', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 4, nombre_generico: 'Insulina NPH', nombre_comercial: undefined, presentacion: 'Inyectable', concentracion: 100, unidad_concentracion: 'UI', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 5, nombre_generico: 'Salbutamol', nombre_comercial: 'Ventolin', presentacion: 'Inhalador', concentracion: 200, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 6, nombre_generico: 'Omeprazol', nombre_comercial: undefined, presentacion: 'Cápsula', concentracion: 20, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 7, nombre_generico: 'Dexametasona', nombre_comercial: undefined, presentacion: 'Inyectable', concentracion: 8, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 8, nombre_generico: 'Doxiciclina', nombre_comercial: undefined, presentacion: 'Tableta', concentracion: 100, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 9, nombre_generico: 'Loperamida', nombre_comercial: undefined, presentacion: 'Tableta', concentracion: 2, unidad_concentracion: 'mg', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 10, nombre_generico: 'Solución Salina', nombre_comercial: undefined, presentacion: 'Solución', concentracion: 500, unidad_concentracion: 'ml', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

const LOTES: Lote[] = [
  { id: 1, medicamento_id: 1, codigo_qr: 'APOPHARMA:LOTE:a1b2c3d4', cantidad_inicial: 200, cantidad_actual: 200, fecha_vencimiento: '2026-12-15', donante: 'MSF', ubicacion: 'Estante A-1', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-01T10:00:00Z' },
  { id: 2, medicamento_id: 2, codigo_qr: 'APOPHARMA:LOTE:e5f6g7h8', cantidad_inicial: 500, cantidad_actual: 500, fecha_vencimiento: '2026-08-20', donante: 'OMS', ubicacion: 'Estante B-2', created_at: '2026-07-02T14:30:00Z', updated_at: '2026-07-02T14:30:00Z' },
  { id: 3, medicamento_id: 1, codigo_qr: 'APOPHARMA:LOTE:i9j0k1l2', cantidad_inicial: 100, cantidad_actual: 100, fecha_vencimiento: '2026-11-01', donante: 'Cruz Roja', ubicacion: 'Estante A-1', created_at: '2026-07-03T09:00:00Z', updated_at: '2026-07-03T09:00:00Z' },
  { id: 4, medicamento_id: 3, codigo_qr: 'APOPHARMA:LOTE:m3n4o5p6', cantidad_inicial: 300, cantidad_actual: 300, fecha_vencimiento: '2027-03-10', donante: 'MSF', ubicacion: 'Estante C-3', created_at: '2026-07-03T11:45:00Z', updated_at: '2026-07-03T11:45:00Z' },
  { id: 5, medicamento_id: 4, codigo_qr: 'APOPHARMA:LOTE:q7r8s9t0', cantidad_inicial: 50, cantidad_actual: 50, fecha_vencimiento: '2026-09-05', donante: 'OMS', ubicacion: 'Refrigerador 1', created_at: '2026-07-04T08:15:00Z', updated_at: '2026-07-04T08:15:00Z' },
];

let nextMedId = 11;
let nextLoteId = 6;

@Injectable({ providedIn: 'root' })
export class MockRecepcionService extends RecepcionService {
  getMedicamentos(search?: string): Observable<Medicamento[]> {
    if (!search) return of([...MEDICAMENTOS]);
    const term = search.toLowerCase();
    const filtered = MEDICAMENTOS.filter(m =>
      m.nombre_generico.toLowerCase().includes(term) ||
      (m.nombre_comercial?.toLowerCase().includes(term) ?? false)
    );
    return of(filtered);
  }

  crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento> {
    const nuevo: Medicamento = {
      id: nextMedId++,
      nombre_generico: dto.nombre_generico!,
      nombre_comercial: dto.nombre_comercial,
      presentacion: dto.presentacion!,
      concentracion: dto.concentracion!,
      unidad_concentracion: dto.unidad_concentracion!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MEDICAMENTOS.push(nuevo);
    return of(nuevo);
  }

  getLotes(page = 1, limit = 20): Observable<Lote[]> {
    const start = (page - 1) * limit;
    const items = LOTES.slice(start, start + limit).map(lote => ({
      ...lote,
      medicamento: MEDICAMENTOS.find(m => m.id === lote.medicamento_id),
    }));
    return of(items);
  }

  crearLote(dto: Partial<Lote>): Observable<Lote> {
    const nuevo: Lote = {
      id: nextLoteId++,
      medicamento_id: dto.medicamento_id!,
      codigo_qr: `APOPHARMA:LOTE:${crypto.randomUUID().slice(0, 8)}`,
      cantidad_inicial: dto.cantidad_inicial!,
      cantidad_actual: dto.cantidad_inicial!,
      fecha_vencimiento: dto.fecha_vencimiento!,
      donante: dto.donante,
      ubicacion: dto.ubicacion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      medicamento: MEDICAMENTOS.find(m => m.id === dto.medicamento_id),
    };
    LOTES.unshift(nuevo);
    return of(nuevo);
  }

  getLoteQR(_id: number): Observable<Blob> {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="50" y="100">QR-MOCK</text></svg>';
    return of(new Blob([svg], { type: 'image/svg+xml' }));
  }
}
