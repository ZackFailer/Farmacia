import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { UserRole } from './enums/role.enum';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.usuarioRepository.count();
    if (count > 0) {
      return;
    }

    const admin = this.usuarioRepository.create({
      nombre: 'admin',
      rol: UserRole.ADMIN,
      pinHash: await hash('123456', 10),
    });

    await this.usuarioRepository.save(admin);
  }
}
