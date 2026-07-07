import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CensoController } from './censo.controller';
import { CensoService } from './censo.service';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { CatalogoPatologia } from '../common/entities/patologia.entity';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, NucleoFamiliar, NucleoFamiliarMiembro, CatalogoPatologia, CatalogoNecesidad]),
  ],
  controllers: [CensoController],
  providers: [CensoService],
})
export class CensoModule {}
