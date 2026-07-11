import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogoPatologia } from '../common/entities/patologia.entity';
import { CrearPatologiaDto } from './dto/crear-patologia.dto';
import { ActualizarPatologiaDto } from './dto/actualizar-patologia.dto';

@Injectable()
export class PatologiaService {
  constructor(
    @InjectRepository(CatalogoPatologia)
    private readonly repo: Repository<CatalogoPatologia>,
  ) {}

  findAll(): Promise<CatalogoPatologia[]> {
    return this.repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  findAllIncludingInactives(): Promise<CatalogoPatologia[]> {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<CatalogoPatologia> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Patología no encontrada');
    return entity;
  }

  create(dto: CrearPatologiaDto, usuarioId?: number): Promise<CatalogoPatologia> {
    const entity = this.repo.create({
      ...dto,
      createdById: usuarioId ?? null,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: ActualizarPatologiaDto, usuarioId?: number): Promise<CatalogoPatologia> {
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
