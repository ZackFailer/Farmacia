import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../common/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(pin: string) {
    const users = await this.usuarioRepository.find();
    let matchedUser: Usuario | null = null;

    for (const user of users) {
      const isValid = await compare(pin, user.pinHash);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid PIN');
    }

    const payload = {
      sub: matchedUser.id,
      nombre: matchedUser.nombre,
      rol: matchedUser.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: matchedUser.id,
        nombre: matchedUser.nombre,
        rol: matchedUser.rol,
      },
    };
  }

  async me(userId: number) {
    const user = await this.usuarioRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    };
  }
}
