import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../common/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pin: string) {
    const user = await this.usuarioRepository.findOne({
      where: { username, activo: true },
    });

    if (!user || !(await compare(pin, user.pinHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }

  async me(userId: number) {
    const user = await this.usuarioRepository.findOne({ where: { id: userId, activo: true } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
    };
  }
}
