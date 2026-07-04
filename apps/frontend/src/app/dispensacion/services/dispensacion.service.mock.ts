import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { DispensacionService } from './dispensacion.service';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Configuracion } from '../../shared/models/configuracion.model';
import type { Dispensacion, CreateDispensacionDto } from '../../shared/models/dispensacion.model';
import { Sexo } from '../../shared/enums/sexo.enum';

const SEED_PACIENTES: Paciente[] = [
  { id: 1, id_emergencia: 'EM-2026-001', sexo: Sexo.M, edad_estimada: 35, peso_estimado: 70, es_damnificado: true, created_at: '2026-07-03T10:00:00Z' },
  { id: 2, id_emergencia: 'EM-2026-002', sexo: Sexo.F, edad_estimada: 28, peso_estimado: 55, es_damnificado: false, created_at: '2026-07-03T10:30:00Z' },
  { id: 3, id_emergencia: 'EM-2026-003', sexo: Sexo.M, edad_estimada: 60, peso_estimado: 80, es_damnificado: true, created_at: '2026-07-03T11:00:00Z' },
];

const SEED_MEDICAMENTOS: Medicamento[] = [
  { id: 1, nombre_generico: 'Amoxicilina', presentacion: 'Suspensión', concentracion: 250, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 2, nombre_generico: 'Paracetamol', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 3, nombre_generico: 'Ibuprofeno', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 4, nombre_generico: 'Loratadina', presentacion: 'Tableta', concentracion: 10, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 5, nombre_generico: 'Salbutamol', presentacion: 'Inhalador', concentracion: 100, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 6, nombre_generico: 'Omeprazol', presentacion: 'Cápsula', concentracion: 20, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 7, nombre_generico: 'Dexametasona', presentacion: 'Inyectable', concentracion: 8, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 8, nombre_generico: 'Diclofenaco', presentacion: 'Tableta', concentracion: 50, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 9, nombre_generico: 'Suero Oral', presentacion: 'Sobre', concentracion: 1, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 10, nombre_generico: 'Metronidazol', presentacion: 'Tableta', concentracion: 250, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
];

const SEED_LOTES: Lote[] = [
  { id: 1, medicamento_id: 1, medicamento: SEED_MEDICAMENTOS[0], codigo_qr: 'L-AMX-001', cantidad_inicial: 500, cantidad_actual: 450, fecha_vencimiento: '2027-06-01', donante: 'Cruz Roja', ubicacion: 'Estante A1', created_at: '', updated_at: '' },
  { id: 2, medicamento_id: 1, medicamento: SEED_MEDICAMENTOS[0], codigo_qr: 'L-AMX-002', cantidad_inicial: 300, cantidad_actual: 50, fecha_vencimiento: '2026-08-15', donante: 'MSF', ubicacion: 'Estante A1', created_at: '', updated_at: '' },
  { id: 3, medicamento_id: 2, medicamento: SEED_MEDICAMENTOS[1], codigo_qr: 'L-PAR-001', cantidad_inicial: 1000, cantidad_actual: 800, fecha_vencimiento: '2028-03-01', ubicacion: 'Estante B2', created_at: '', updated_at: '' },
  { id: 4, medicamento_id: 3, medicamento: SEED_MEDICAMENTOS[2], codigo_qr: 'L-IBU-001', cantidad_inicial: 200, cantidad_actual: 200, fecha_vencimiento: '2027-11-20', donante: 'UNICEF', created_at: '', updated_at: '' },
  { id: 5, medicamento_id: 8, medicamento: SEED_MEDICAMENTOS[7], codigo_qr: 'L-DIC-001', cantidad_inicial: 150, cantidad_actual: 120, fecha_vencimiento: '2026-09-10', ubicacion: 'Estante C3', created_at: '', updated_at: '' },
  { id: 6, medicamento_id: 5, medicamento: SEED_MEDICAMENTOS[4], codigo_qr: 'L-SAL-001', cantidad_inicial: 100, cantidad_actual: 80, fecha_vencimiento: '2027-05-30', donante: 'Cruz Roja', created_at: '', updated_at: '' },
  { id: 7, medicamento_id: 6, medicamento: SEED_MEDICAMENTOS[5], codigo_qr: 'L-OME-001', cantidad_inicial: 300, cantidad_actual: 250, fecha_vencimiento: '2028-01-15', ubicacion: 'Estante A2', created_at: '', updated_at: '' },
];

const SEED_CONFIGS: Configuracion[] = [
  { id: 1, medicamento_id: 1, umbral_minimo: 100, dosis_maxima_mg_kg: 15, peso_referencia_kg: 70, updated_at: '' },
  { id: 2, medicamento_id: 2, umbral_minimo: 200, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '' },
  { id: 3, medicamento_id: 3, umbral_minimo: 50, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '' },
];

let nextPacienteId = 4;
let nextDispensacionId = 1;
const dispensaciones: Dispensacion[] = [];

@Injectable()
export class MockDispensacionService extends DispensacionService {
  registrarPaciente(dto: CreatePacienteDto): Observable<Paciente> {
    const exists = SEED_PACIENTES.find(p => p.id_emergencia === dto.id_emergencia);
    if (exists) return throwError(() => new Error('Ya existe un paciente con ese ID de emergencia'));

    const nuevo: Paciente = {
      id: nextPacienteId++,
      ...dto,
      created_at: new Date().toISOString(),
    };
    SEED_PACIENTES.push(nuevo);
    return of(nuevo);
  }

  buscarPaciente(idEmergencia: string): Observable<Paciente> {
    const p = SEED_PACIENTES.find(pac => pac.id_emergencia === idEmergencia);
    if (!p) return throwError(() => new Error('Paciente no encontrado'));
    return of(p);
  }

  buscarMedicamentos(search: string): Observable<Medicamento[]> {
    const s = search.toLowerCase();
    const results = SEED_MEDICAMENTOS.filter(m =>
      m.nombre_generico.toLowerCase().includes(s) ||
      (m.nombre_comercial?.toLowerCase().includes(s))
    );
    return of(results);
  }

  getLotesDisponibles(medicamentoId: number): Observable<Lote[]> {
    const lotes = SEED_LOTES
      .filter(l => l.medicamento_id === medicamentoId && l.cantidad_actual > 0)
      .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());
    return of(lotes);
  }

  getLimiteDosis(medicamentoId: number): Observable<Configuracion | null> {
    const config = SEED_CONFIGS.find(c => c.medicamento_id === medicamentoId) ?? null;
    return of(config);
  }

  crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion> {
    const paciente = SEED_PACIENTES.find(p => p.id === dto.paciente_id);
    if (!paciente) return throwError(() => new Error('Paciente no encontrado'));

    const items = dto.items.map((item, i) => {
      const lote = SEED_LOTES.find(l => l.id === item.lote_id);
      if (!lote) throw new Error(`Lote ${item.lote_id} no encontrado`);
      if (lote.cantidad_actual < item.cantidad) throw new Error(`Stock insuficiente en lote ${lote.codigo_qr}`);

      const medicamento = SEED_MEDICAMENTOS.find(m => m.id === item.medicamento_id);
      const dosisMgKg = paciente.peso_estimado > 0
        ? (item.cantidad * (medicamento?.concentracion ?? 0)) / paciente.peso_estimado
        : undefined;

      lote.cantidad_actual -= item.cantidad;

      return {
        id: i + 1,
        dispensacion_id: nextDispensacionId,
        lote_id: item.lote_id,
        medicamento_id: item.medicamento_id,
        medicamento_nombre: medicamento?.nombre_generico,
        lote_codigo: lote.codigo_qr,
        cantidad: item.cantidad,
        dosis_mg_kg: dosisMgKg,
        created_at: new Date().toISOString(),
      };
    });

    const dispensacion: Dispensacion = {
      id: nextDispensacionId++,
      paciente_id: dto.paciente_id,
      usuario_id: 1,
      fecha_hora: new Date().toISOString(),
      observaciones: dto.observaciones,
      items,
      paciente,
    };
    dispensaciones.push(dispensacion);
    return of(dispensacion);
  }
}
