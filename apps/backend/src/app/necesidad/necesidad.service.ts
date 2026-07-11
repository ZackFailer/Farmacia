import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';
import { CrearNecesidadDto } from './dto/crear-necesidad.dto';
import { ActualizarNecesidadDto } from './dto/actualizar-necesidad.dto';

@Injectable()
export class NecesidadService {
  constructor(
    @InjectRepository(CatalogoNecesidad)
    private readonly repo: Repository<CatalogoNecesidad>,
  ) {}

  findAll(): Promise<CatalogoNecesidad[]> {
    return this.repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  findAllIncludingInactives(): Promise<CatalogoNecesidad[]> {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<CatalogoNecesidad> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Necesidad no encontrada');
    return entity;
  }

  create(dto: CrearNecesidadDto, usuarioId?: number): Promise<CatalogoNecesidad> {
    const entity = this.repo.create({
      ...dto,
      createdById: usuarioId ?? null,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: ActualizarNecesidadDto, usuarioId?: number): Promise<CatalogoNecesidad> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.updatedById = usuarioId ?? null;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
