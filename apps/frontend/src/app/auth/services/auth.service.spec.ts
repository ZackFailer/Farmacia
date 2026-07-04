import { TestBed } from '@angular/core/testing';
import { MockAuthService } from './auth.service.mock';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useClass: MockAuthService }],
    });
    service = TestBed.inject(AuthService) as MockAuthService;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe rechazar PIN incorrecto', async () => {
    await expect(firstValueFrom(service.login('0000'))).rejects.toThrow();
  });

  it('debe aceptar PIN 123456 y guardar token', async () => {
    const res = await firstValueFrom(service.login('123456'));
    expect(res.token).toBeTruthy();
    expect(res.usuario.nombre).toBe('Administrador');
    expect(res.usuario.rol).toBe('farmaceutico');
    expect(localStorage.getItem('apoPharma_token')).toBeTruthy();
  });

  it('isLoggedIn debe retornar true despues de login', async () => {
    await firstValueFrom(service.login('123456'));
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout debe limpiar localStorage', async () => {
    await firstValueFrom(service.login('123456'));
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('getUsuario debe retornar null si no hay sesion', () => {
    expect(service.getUsuario()).toBeNull();
  });
});
