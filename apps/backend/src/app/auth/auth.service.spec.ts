import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../common/entities/usuario.entity';
import { UserRole } from '../common/enums/role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<Repository<Usuario>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    repo = moduleRef.get(getRepositoryToken(Usuario));
  });

  it('should login with valid pin', async () => {
    const pinHash = await hash('123456', 1);
    repo.find.mockResolvedValue([
      {
        id: 1,
        nombre: 'admin',
        rol: UserRole.PHARMACEUTICAL,
        pinHash,
      } as Usuario,
    ]);

    const result = await service.login('123456');

    expect(result.token).toBe('signed-token');
    expect(result.usuario).toEqual({
      id: 1,
      nombre: 'admin',
      rol: UserRole.PHARMACEUTICAL,
    });
  });

  it('should throw with invalid pin', async () => {
    const pinHash = await hash('999999', 1);
    repo.find.mockResolvedValue([
      {
        id: 1,
        nombre: 'admin',
        rol: UserRole.PHARMACEUTICAL,
        pinHash,
      } as Usuario,
    ]);

    await expect(service.login('123456')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
