import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispensacionController } from './dispensacion.controller';
import { DispensacionService } from './dispensacion.service';
import { Lote } from '../common/entities/lote.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lote,
      Configuracion,
      Dispensacion,
      DispensacionDetalle,
      LoteMovimiento,
    ]),
  ],
  controllers: [DispensacionController],
  providers: [DispensacionService],
  exports: [DispensacionService],
})
export class DispensacionModule {}
