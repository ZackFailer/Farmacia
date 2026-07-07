import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { PacientePatologia } from '../common/entities/paciente-patologia.entity';
import { PacienteNecesidad } from '../common/entities/paciente-necesidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, NucleoFamiliar, NucleoFamiliarMiembro, PacientePatologia, PacienteNecesidad]),
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
