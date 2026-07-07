/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AdministracionService } from './administracion.service';
import { MockAdministracionService } from './administracion.service.mock';
import { Rol } from '../../shared/enums/rol.enum';

describe('AdministracionService', () => {
  let service: MockAdministracionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AdministracionService, useClass: MockAdministracionService }],
    });
    service = TestBed.inject(AdministracionService) as MockAdministracionService;
  });

  it('debe listar usuarios', async () => {
    const users = await firstValueFrom(service.getUsuarios());
    expect(users.length).toBeGreaterThanOrEqual(3);
  });

  it('debe crear un usuario', async () => {
    const u = await firstValueFrom(service.crearUsuario({
      username: 'testuser',
      nombre: 'Test User',
      rol: Rol.RECEPTIONIST,
      pin: '1234',
    }));
    expect(u.id).toBeGreaterThan(0);
    expect(u.nombre).toBe('Test User');
  });

  it('debe rechazar creacion con PIN invalido', async () => {
    await expect(firstValueFrom(service.crearUsuario({
      username: 'test',
      nombre: 'Test',
      rol: Rol.RECEPTIONIST,
      pin: '12',
    }))).rejects.toThrow('PIN');
  });

  it('debe actualizar un usuario existente', async () => {
    const u = await firstValueFrom(service.actualizarUsuario(1, { nombre: 'Admin Actualizado' }));
    expect(u.nombre).toBe('Admin Actualizado');

    const users = await firstValueFrom(service.getUsuarios());
    expect(users.find(x => x.id === 1)!.nombre).toBe('Admin Actualizado');
  });

  it('debe rechazar actualizar usuario inexistente', async () => {
    await expect(firstValueFrom(service.actualizarUsuario(999, { nombre: 'X' }))).rejects.toThrow();
  });

  it('debe eliminar un usuario', async () => {
    const before = await firstValueFrom(service.getUsuarios());
    const beforeCount = before.length;

    await firstValueFrom(service.eliminarUsuario(3));
    const after = await firstValueFrom(service.getUsuarios());
    expect(after.length).toBe(beforeCount - 1);
  });

  it('debe rechazar eliminar el ultimo administrador', async () => {
    await expect(firstValueFrom(service.eliminarUsuario(1))).rejects.toThrow('último administrador');
  });

  it('debe listar configuraciones con medicamento', async () => {
    const configs = await firstValueFrom(service.getConfiguraciones());
    expect(configs.length).toBeGreaterThanOrEqual(10);
    expect(configs[0].medicamento).toBeDefined();
    expect(configs[0].medicamento!.nombre_generico).toBe('Amoxicilina');
  });

  it('debe actualizar configuracion', async () => {
    const result = await firstValueFrom(service.actualizarConfiguracion(1, { dosis_maxima_mg_kg: 20 }));
    expect(result.dosis_maxima_mg_kg).toBe(20);
  });
});
