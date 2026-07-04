import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HistorialService } from './historial.service';
import { MockHistorialService } from './historial.service.mock';

describe('HistorialService', () => {
  let service: MockHistorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HistorialService, useClass: MockHistorialService }],
    });
    service = TestBed.inject(HistorialService) as MockHistorialService;
  });

  it('debe retornar historial ordenado por fecha DESC', async () => {
    const results = await firstValueFrom(service.getHistorialPaciente(1));
    expect(results.length).toBe(2);
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(2);
    expect(new Date(results[0].fecha_hora).getTime())
      .toBeGreaterThan(new Date(results[1].fecha_hora).getTime());
  });

  it('debe incluir items y paciente en cada dispensacion', async () => {
    const results = await firstValueFrom(service.getHistorialPaciente(1));
    expect(results[0].items.length).toBeGreaterThan(0);
    expect(results[0].paciente).toBeDefined();
    expect(results[0].paciente!.id_emergencia).toBe('EM-2026-001');
  });

  it('debe retornar array vacio si no hay dispensaciones', async () => {
    const results = await firstValueFrom(service.getHistorialPaciente(999));
    expect(results).toEqual([]);
  });

  it('debe retornar detalle de dispensacion por ID', async () => {
    const d = await firstValueFrom(service.getDetalleDispensacion(1));
    expect(d.id).toBe(1);
    expect(d.items.length).toBe(2);
    expect(d.despachado_por).toBe('Administrador');
  });

  it('debe rechazar detalle de dispensacion inexistente', async () => {
    await expect(firstValueFrom(service.getDetalleDispensacion(999))).rejects.toThrow();
  });
});
