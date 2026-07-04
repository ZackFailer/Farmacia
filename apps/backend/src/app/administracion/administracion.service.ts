import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { Usuario } from '../common/entities/usuario.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarConfiguracionDto } from './dto/actualizar-configuracion.dto';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class AdministracionService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
  ) {}

  getUsuarios() {
    return this.usuarioRepository.find({
      order: { id: 'ASC' },
      select: ['id', 'nombre', 'rol', 'createdAt', 'updatedAt'],
    });
  }

  async createUsuario(dto: CrearUsuarioDto) {
    const pinHash = await hash(dto.pin, 10);
    const usuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      rol: dto.rol,
      pinHash,
    });
    const saved = await this.usuarioRepository.save(usuario);
    return {
      id: saved.id,
      nombre: saved.nombre,
      rol: saved.rol,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async updateUsuario(id: number, dto: ActualizarUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('User not found');
    }

    if (dto.nombre !== undefined) {
      usuario.nombre = dto.nombre;
    }

    if (dto.rol !== undefined) {
      usuario.rol = dto.rol;
    }

    if (dto.pin !== undefined) {
      usuario.pinHash = await hash(dto.pin, 10);
    }

    const updated = await this.usuarioRepository.save(usuario);
    return {
      id: updated.id,
      nombre: updated.nombre,
      rol: updated.rol,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteUsuario(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('User not found');
    }

    if (usuario.rol === UserRole.PHARMACEUTICAL) {
      const admins = await this.usuarioRepository.count({
        where: { rol: UserRole.PHARMACEUTICAL },
      });
      if (admins <= 1) {
        throw new BadRequestException('Cannot delete last administrator');
      }
    }

    await this.usuarioRepository.delete(id);
    return { success: true };
  }

  getConfiguraciones() {
    return this.configuracionRepository.find({
      relations: { medicamento: true },
      order: { id: 'ASC' },
    });
  }

  async updateConfiguracion(id: number, dto: ActualizarConfiguracionDto) {
    const configuracion = await this.configuracionRepository.findOne({
      where: { id },
    });
    if (!configuracion) {
      throw new NotFoundException('Configuration not found');
    }

    if (dto.umbralMinimo !== undefined) {
      configuracion.umbralMinimo = dto.umbralMinimo;
    }
    if (dto.dosisMaximaMgKg !== undefined) {
      configuracion.dosisMaximaMgKg = dto.dosisMaximaMgKg;
    }
    if (dto.pesoReferenciaKg !== undefined) {
      configuracion.pesoReferenciaKg = dto.pesoReferenciaKg;
    }

    return this.configuracionRepository.save(configuracion);
  }
}
