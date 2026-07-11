/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DispensacionService } from './dispensacion.service';
import { MockDispensacionService } from './dispensacion.service.mock';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { CreatePacienteDto } from '../../shared/models/paciente.model';

describe('DispensacionService', () => {
  let service: MockDispensacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: DispensacionService, useClass: MockDispensacionService }],
    });
    service = TestBed.inject(DispensacionService) as MockDispensacionService;
  });

  // ── Paciente ──

  it('debe buscar paciente por ID de emergencia', async () => {
    const items = await firstValueFrom(service.buscarPaciente('EM-2026-001'));
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].id_emergencia).toBe('EM-2026-001');
    expect(items[0].sexo).toBe(Sexo.M);
    expect(items[0].peso_estimado).toBe(70);
  });

  it('debe retornar lista vacia para paciente inexistente', async () => {
    const items = await firstValueFrom(service.buscarPaciente('XX-999'));
    expect(items.length).toBe(0);
  });

  it('debe registrar un nuevo paciente exitosamente', async () => {
    const dto: CreatePacienteDto = {
      id_emergencia: 'EM-2026-099',
      nombre: 'Laura',
      apellido: 'Mendez',
      sexo: Sexo.F,
      edad_estimada: 25,
      peso_estimado: 60,
      situacion_vivienda: 'no_afectado',
    };
    const p = await firstValueFrom(service.registrarPaciente(dto));
    expect(p.id_emergencia).toBe('EM-2026-099');
    expect(p.id).toBeGreaterThan(0);
    expect(p.created_at).toBeTruthy();

    const items = await firstValueFrom(service.buscarPaciente('EM-2026-099'));
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].id).toBe(p.id);
  });

  it('debe rechazar registro con ID de emergencia duplicado', async () => {
    const dto = {
      id_emergencia: 'EM-2026-001',
      nombre: 'Test',
      apellido: 'Duplicado',
      sexo: Sexo.M,
      edad_estimada: 30,
      peso_estimado: 70,
      situacion_vivienda: 'damnificado',
    };
    await expect(firstValueFrom(service.registrarPaciente(dto))).rejects.toThrow();
  });

  // ── Medicamentos ──

  it('debe buscar medicamentos por nombre generico', async () => {
    const results = await firstValueFrom(service.buscarMedicamentos('amoxi'));
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nombre_generico).toContain('Amoxicilina');
  });

  it('debe retornar lista vacia si no hay coincidencias', async () => {
    const results = await firstValueFrom(service.buscarMedicamentos('zzzxxx'));
    expect(results.length).toBe(0);
  });

  // ── Configuración / Dosis ──

  it('debe retornar configuracion de dosis para medicamento configurado', async () => {
    const config = await firstValueFrom(service.getLimiteDosis(1));
    expect(config).not.toBeNull();
    expect(config!.dosis_maxima_mg_kg).toBe(15);
  });

  it('debe retornar null si no hay configuracion de dosis', async () => {
    const config = await firstValueFrom(service.getLimiteDosis(4));
    expect(config).toBeNull();
  });

  // ── Crear dispensación (sin lotes) ──

  it('debe crear dispensacion correctamente', async () => {
    const d = await firstValueFrom(service.crearDispensacion({
      paciente_id: 1,
      items: [{ medicamento_id: 1, cantidad: 10 }],
    }));

    expect(d.id).toBeGreaterThan(0);
    expect(d.items.length).toBe(1);
    expect(d.items[0].cantidad).toBe(10);
    expect(d.items[0].medicamento_nombre).toBe('Amoxicilina');
  });

  it('debe calcular dosis_mg_kg en el detalle', async () => {
    const d = await firstValueFrom(service.crearDispensacion({
      paciente_id: 1,
      items: [{ medicamento_id: 1, cantidad: 2 }],
    }));
    // Paciente 1 pesa 70kg, Amoxicilina 250mg, cantidad 2 → (2*250)/70 ≈ 7.14
    expect(d.items[0].dosis_mg_kg).toBeCloseTo(7.14, 1);
  });

  it('debe rechazar dispensacion con paciente inexistente', async () => {
    await expect(firstValueFrom(service.crearDispensacion({
      paciente_id: 999,
      items: [{ medicamento_id: 1, cantidad: 1 }],
    }))).rejects.toThrow('Paciente no encontrado');
  });

  // ── Estado compartido (señales) ──

  it('setPaciente debe actualizar estado y avanzar a paso 2', () => {
    expect(service.estado().paso).toBe(1);
    expect(service.estado().paciente).toBeNull();

    service.setPaciente({ id: 1, id_emergencia: 'EM-TEST', nombre: 'Jose', apellido: 'Prueba', sexo: Sexo.M, edad_estimada: 30, peso_estimado: 70, situacion_vivienda: 'no_afectado', tiene_carga_familiar: false, created_at: '' });

    expect(service.estado().paciente).not.toBeNull();
    expect(service.estado().paciente!.id_emergencia).toBe('EM-TEST');
    expect(service.estado().paso).toBe(2);
  });

  it('agregarItem debe añadir a la lista', () => {
    expect(service.estado().items.length).toBe(0);

    const item = { medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, cantidad: 5 };
    service.agregarItem(item);

    expect(service.estado().items.length).toBe(1);
    expect(service.estado().items[0].cantidad).toBe(5);
  });

  it('eliminarItem debe remover por indice', () => {
    const item = { medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, cantidad: 5 };
    service.agregarItem(item);
    expect(service.estado().items.length).toBe(1);

    service.eliminarItem(0);
    expect(service.estado().items.length).toBe(0);
  });

  it('reiniciar debe resetear todo el estado', () => {
    service.setPaciente({ id: 1, id_emergencia: 'EM-TEST', nombre: 'Jose', apellido: 'Prueba', sexo: Sexo.M, edad_estimada: 30, peso_estimado: 70, situacion_vivienda: 'no_afectado', tiene_carga_familiar: false, created_at: '' });
    service.agregarItem({ medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, cantidad: 5 });
    expect(service.estado().paso).toBe(2);
    expect(service.estado().items.length).toBe(1);

    service.reiniciar();
    expect(service.estado().paso).toBe(1);
    expect(service.estado().paciente).toBeNull();
    expect(service.estado().items.length).toBe(0);
  });
});
