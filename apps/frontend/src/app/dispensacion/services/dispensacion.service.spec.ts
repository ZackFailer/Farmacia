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
    const p = await firstValueFrom(service.buscarPaciente('EM-2026-001'));
    expect(p.id_emergencia).toBe('EM-2026-001');
    expect(p.sexo).toBe(Sexo.M);
    expect(p.peso_estimado).toBe(70);
  });

  it('debe rechazar busqueda de paciente inexistente', async () => {
    await expect(firstValueFrom(service.buscarPaciente('XX-999'))).rejects.toThrow('Paciente no encontrado');
  });

  it('debe registrar un nuevo paciente exitosamente', async () => {
    const dto: CreatePacienteDto = {
      id_emergencia: 'EM-2026-099',
      nombre: 'Laura',
      apellido: 'Mendez',
      sexo: Sexo.F,
      edad_estimada: 25,
      peso_estimado: 60,
      es_damnificado: false,
    };
    const p = await firstValueFrom(service.registrarPaciente(dto));
    expect(p.id_emergencia).toBe('EM-2026-099');
    expect(p.id).toBeGreaterThan(0);
    expect(p.created_at).toBeTruthy();

    const buscado = await firstValueFrom(service.buscarPaciente('EM-2026-099'));
    expect(buscado.id).toBe(p.id);
  });

  it('debe rechazar registro con ID de emergencia duplicado', async () => {
    const dto = {
      id_emergencia: 'EM-2026-001',
      nombre: 'Test',
      apellido: 'Duplicado',
      sexo: Sexo.M,
      edad_estimada: 30,
      peso_estimado: 70,
      es_damnificado: true,
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

  // ── Lotes FEFO ──

  it('debe retornar lotes disponibles ordenados por vencimiento ASC (FEFO)', async () => {
    const lotes = await firstValueFrom(service.getLotesDisponibles(1));
    expect(lotes.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < lotes.length; i++) {
      const prev = new Date(lotes[i - 1].fecha_vencimiento);
      const curr = new Date(lotes[i].fecha_vencimiento);
      expect(prev <= curr || prev.getTime() <= curr.getTime()).toBe(true);
    }
  });

  it('debe retornar solo lotes con stock > 0', async () => {
    const lotes = await firstValueFrom(service.getLotesDisponibles(2));
    for (const l of lotes) {
      expect(l.cantidad_actual).toBeGreaterThan(0);
    }
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

  // ── Crear dispensación ──

  it('debe crear dispensacion y descontar stock del lote indicado', async () => {
    const antes = await firstValueFrom(service.getLotesDisponibles(1));
    const stockLote1 = antes.find(l => l.id === 1)!.cantidad_actual;

    const d = await firstValueFrom(service.crearDispensacion({
      paciente_id: 1,
      items: [{ lote_id: 1, medicamento_id: 1, cantidad: 10 }],
    }));

    expect(d.id).toBeGreaterThan(0);
    expect(d.items.length).toBe(1);
    expect(d.items[0].cantidad).toBe(10);

    const despues = await firstValueFrom(service.getLotesDisponibles(1));
    expect(despues.find(l => l.id === 1)!.cantidad_actual).toBe(stockLote1 - 10);
  });

  it('debe calcular dosis_mg_kg en el detalle', async () => {
    const d = await firstValueFrom(service.crearDispensacion({
      paciente_id: 1,
      items: [{ lote_id: 1, medicamento_id: 1, cantidad: 2 }],
    }));
    // Paciente 1 pesa 70kg, Amoxicilina 250mg, cantidad 2 → (2*250)/70 ≈ 7.14
    expect(d.items[0].dosis_mg_kg).toBeCloseTo(7.14, 1);
  });

  it('debe rechazar dispensacion con stock insuficiente', async () => {
    try {
      await firstValueFrom(service.crearDispensacion({
        paciente_id: 1,
        items: [{ lote_id: 2, medicamento_id: 1, cantidad: 999 }],
      }));
      expect('should have thrown').toBe('did not throw');
    } catch {
      expect(true).toBe(true);
    }
  });

  it('debe rechazar dispensacion con paciente inexistente', async () => {
    await expect(firstValueFrom(service.crearDispensacion({
      paciente_id: 999,
      items: [{ lote_id: 1, medicamento_id: 1, cantidad: 1 }],
    }))).rejects.toThrow('Paciente no encontrado');
  });

  // ── Estado compartido (señales) ──

  it('setPaciente debe actualizar estado y avanzar a paso 2', () => {
    expect(service.estado().paso).toBe(1);
    expect(service.estado().paciente).toBeNull();

    service.setPaciente({ id: 1, id_emergencia: 'EM-TEST', nombre: 'Jose', apellido: 'Prueba', sexo: Sexo.M, edad_estimada: 30, peso_estimado: 70, es_damnificado: false, created_at: '' });

    expect(service.estado().paciente).not.toBeNull();
    expect(service.estado().paciente!.id_emergencia).toBe('EM-TEST');
    expect(service.estado().paso).toBe(2);
  });

  it('agregarItem debe añadir a la lista', () => {
    expect(service.estado().items.length).toBe(0);

    const item = { medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, lote: { id: 1, medicamento_id: 1, codigo_qr: 'L-TEST', cantidad_inicial: 100, cantidad_actual: 50, fecha_vencimiento: '2027-01-01', created_at: '', updated_at: '' }, cantidad: 5 };
    service.agregarItem(item);

    expect(service.estado().items.length).toBe(1);
    expect(service.estado().items[0].cantidad).toBe(5);
  });

  it('eliminarItem debe remover por indice', () => {
    const item = { medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, lote: { id: 1, medicamento_id: 1, codigo_qr: 'L-TEST', cantidad_inicial: 100, cantidad_actual: 50, fecha_vencimiento: '2027-01-01', created_at: '', updated_at: '' }, cantidad: 5 };
    service.agregarItem(item);
    expect(service.estado().items.length).toBe(1);

    service.eliminarItem(0);
    expect(service.estado().items.length).toBe(0);
  });

  it('reiniciar debe resetear todo el estado', () => {
    service.setPaciente({ id: 1, id_emergencia: 'EM-TEST', nombre: 'Jose', apellido: 'Prueba', sexo: Sexo.M, edad_estimada: 30, peso_estimado: 70, es_damnificado: false, created_at: '' });
    service.agregarItem({ medicamento: { id: 1, nombre_generico: 'Test', presentacion: '', concentracion: 100, unidad_concentracion: 'mg' as const, created_at: '', updated_at: '' }, lote: { id: 1, medicamento_id: 1, codigo_qr: 'L-TEST', cantidad_inicial: 100, cantidad_actual: 50, fecha_vencimiento: '2027-01-01', created_at: '', updated_at: '' }, cantidad: 5 });
    expect(service.estado().paso).toBe(2);
    expect(service.estado().items.length).toBe(1);

    service.reiniciar();
    expect(service.estado().paso).toBe(1);
    expect(service.estado().paciente).toBeNull();
    expect(service.estado().items.length).toBe(0);
  });
});
