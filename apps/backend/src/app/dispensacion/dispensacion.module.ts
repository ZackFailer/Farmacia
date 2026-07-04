import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispensacionController } from './dispensacion.controller';
import { DispensacionService } from './dispensacion.service';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { Lote } from '../common/entities/lote.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';
import { Medicamento } from '../common/entities/medicamento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Paciente,
      NucleoFamiliar,
      NucleoFamiliarMiembro,
      Lote,
      Configuracion,
      Dispensacion,
      DispensacionDetalle,
      LoteMovimiento,
      Medicamento,
    ]),
  ],
  controllers: [DispensacionController],
  providers: [DispensacionService],
  exports: [DispensacionService],
})
export class DispensacionModule {}
