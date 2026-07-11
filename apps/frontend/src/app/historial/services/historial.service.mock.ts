import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { HistorialService } from './historial.service';
import type { Dispensacion } from '../../shared/models/dispensacion.model';
import { Sexo } from '../../shared/enums/sexo.enum';

const SEED: Dispensacion[] = [
  {
    id: 1,
    paciente_id: 1,
    usuario_id: 1,
    fecha_hora: '2026-07-03T14:30:00Z',
    despachado_por: 'Administrador',
    paciente: { id: 1, id_emergencia: 'EM-2026-001', nombre: 'Juan', apellido: 'Perez', sexo: Sexo.M, edad_estimada: 35, peso_estimado: 70, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, created_at: '2026-07-03T10:00:00Z' },
    items: [
      { id: 1, dispensacion_id: 1, medicamento_id: 1, medicamento_nombre: 'Amoxicilina', cantidad: 2, dosis_mg_kg: 7.14, created_at: '2026-07-03T14:30:00Z' },
      { id: 2, dispensacion_id: 1, medicamento_id: 2, medicamento_nombre: 'Paracetamol', cantidad: 1, dosis_mg_kg: 7.14, created_at: '2026-07-03T14:30:00Z' },
    ],
    observaciones: 'Paciente con fiebre y dolor',
  },
  {
    id: 2,
    paciente_id: 1,
    usuario_id: 2,
    fecha_hora: '2026-07-01T09:15:00Z',
    despachado_por: 'Carlos Ruiz',
    paciente: { id: 1, id_emergencia: 'EM-2026-001', nombre: 'Juan', apellido: 'Perez', sexo: Sexo.M, edad_estimada: 35, peso_estimado: 70, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, created_at: '2026-07-03T10:00:00Z' },
    items: [
      { id: 3, dispensacion_id: 2, medicamento_id: 2, medicamento_nombre: 'Paracetamol', cantidad: 1, dosis_mg_kg: 7.14, created_at: '2026-07-01T09:15:00Z' },
    ],
  },
  {
    id: 3,
    paciente_id: 2,
    usuario_id: 1,
    fecha_hora: '2026-07-02T11:00:00Z',
    despachado_por: 'Administrador',
    paciente: { id: 2, id_emergencia: 'EM-2026-002', nombre: 'Maria', apellido: 'Gonzalez', sexo: Sexo.F, edad_estimada: 28, peso_estimado: 55, situacion_vivienda: 'no_afectado', tiene_carga_familiar: false, created_at: '2026-07-03T10:30:00Z' },
    items: [
      { id: 4, dispensacion_id: 3, medicamento_id: 1, medicamento_nombre: 'Amoxicilina', cantidad: 3, dosis_mg_kg: 13.64, created_at: '2026-07-02T11:00:00Z' },
      { id: 5, dispensacion_id: 3, medicamento_id: 3, medicamento_nombre: 'Ibuprofeno', cantidad: 2, dosis_mg_kg: 14.55, created_at: '2026-07-02T11:00:00Z' },
    ],
    observaciones: 'Trauma en brazo derecho',
  },
];

@Injectable()
export class MockHistorialService extends HistorialService {
  getHistorialPaciente(idEmergencia: string): Observable<Dispensacion[]> {
    const results = SEED
      .filter((d) => d.paciente?.id_emergencia === idEmergencia)
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
    return of(results);
  }

  getDetalleDispensacion(id: number): Observable<Dispensacion> {
    const d = SEED.find(disp => disp.id === id);
    if (!d) return throwError(() => new Error('Dispensación no encontrada'));
    return of(d);
  }
}
