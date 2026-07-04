import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { Paciente } from '../common/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispensacion, Paciente])],
  controllers: [HistorialController],
  providers: [HistorialService],
})
export class HistorialModule {}
