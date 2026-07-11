/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { RecepcionService } from './recepcion.service';
import type { Medicamento } from '../../shared/models/medicamento.model';

const MEDICAMENTOS: Medicamento[] = [
  { id: 1, nombre_generico: 'Paracetamol', nombre_comercial: 'Tempra', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, nombre_generico: 'Amoxicilina', nombre_comercial: undefined, presentacion: 'Suspensión', concentracion: 250, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 3, nombre_generico: 'Ibuprofeno', nombre_comercial: 'Advil', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 4, nombre_generico: 'Insulina NPH', nombre_comercial: undefined, presentacion: 'Inyectable', concentracion: 100, unidad_concentracion: 'UI', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 5, nombre_generico: 'Salbutamol', nombre_comercial: 'Ventolin', presentacion: 'Inhalador', concentracion: 200, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 6, nombre_generico: 'Omeprazol', nombre_comercial: undefined, presentacion: 'Cápsula', concentracion: 20, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 7, nombre_generico: 'Dexametasona', nombre_comercial: undefined, presentacion: 'Inyectable', concentracion: 8, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 8, nombre_generico: 'Doxiciclina', nombre_comercial: undefined, presentacion: 'Tableta', concentracion: 100, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 9, nombre_generico: 'Loperamida', nombre_comercial: undefined, presentacion: 'Tableta', concentracion: 2, unidad_concentracion: 'mg', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 10, nombre_generico: 'Solución Salina', nombre_comercial: undefined, presentacion: 'Solución', concentracion: 500, unidad_concentracion: 'ml', es_vital: false, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

let nextMedId = 11;

@Injectable()
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
      es_vital: dto.es_vital ?? false,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MEDICAMENTOS.push(nuevo);
    return of(nuevo);
  }

  actualizarMedicamento(id: number, dto: Partial<Medicamento>): Observable<Medicamento> {
    const idx = MEDICAMENTOS.findIndex(m => m.id === id);
    if (idx === -1) return throwError(() => new Error('Medicamento no encontrado'));
    MEDICAMENTOS[idx] = {
      ...MEDICAMENTOS[idx],
      ...(dto.nombre_generico !== undefined && { nombre_generico: dto.nombre_generico }),
      ...(dto.nombre_comercial !== undefined && { nombre_comercial: dto.nombre_comercial }),
      ...(dto.presentacion !== undefined && { presentacion: dto.presentacion }),
      ...(dto.concentracion !== undefined && { concentracion: dto.concentracion }),
      ...(dto.unidad_concentracion !== undefined && { unidad_concentracion: dto.unidad_concentracion }),
      ...(dto.es_vital !== undefined && { es_vital: dto.es_vital }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
      updated_at: new Date().toISOString(),
    };
    return of({ ...MEDICAMENTOS[idx] });
  }

  eliminarMedicamento(id: number): Observable<void> {
    const idx = MEDICAMENTOS.findIndex(m => m.id === id);
    if (idx === -1) return throwError(() => new Error('Medicamento no encontrado'));
    MEDICAMENTOS.splice(idx, 1);
    return of(void 0);
  }

}
