import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NecesidadController } from './necesidad.controller';
import { NecesidadService } from './necesidad.service';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogoNecesidad])],
  controllers: [NecesidadController],
  providers: [NecesidadService],
  exports: [NecesidadService],
})
export class NecesidadModule {}
