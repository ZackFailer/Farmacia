import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministracionService } from './administracion.service';
import { Usuario } from '../common/entities/usuario.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { UserRole } from '../common/enums/role.enum';

describe('AdministracionService', () => {
  let service: AdministracionService;
  let usuarioRepository: jest.Mocked<Repository<Usuario>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdministracionService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Configuracion),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AdministracionService);
    usuarioRepository = moduleRef.get(getRepositoryToken(Usuario));
  });

  it('should block deleting the last admin', async () => {
    usuarioRepository.findOne.mockResolvedValue({
      id: 1,
      nombre: 'admin',
      rol: UserRole.ADMIN,
    } as Usuario);
    usuarioRepository.count.mockResolvedValue(1);

    await expect(service.deleteUsuario(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should soft delete non-last admin', async () => {
    const user = {
      id: 2,
      nombre: 'admin2',
      rol: UserRole.ADMIN,
    } as Usuario;
    usuarioRepository.findOne.mockResolvedValue(user);
    usuarioRepository.count.mockResolvedValue(2);
    usuarioRepository.save.mockResolvedValue({ ...user, activo: false });

    await expect(service.deleteUsuario(2)).resolves.toEqual({ success: true });
    expect(usuarioRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ activo: false }),
    );
  });
});
