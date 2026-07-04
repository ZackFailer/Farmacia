import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Lote } from '../common/entities/lote.entity';
import { RecepcionController } from './recepcion.controller';
import { RecepcionService } from './recepcion.service';
import { Configuracion } from '../common/entities/configuracion.entity';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicamento, Lote, Configuracion, LoteMovimiento]),
  ],
  controllers: [RecepcionController],
  providers: [RecepcionService],
  exports: [RecepcionService],
})
export class RecepcionModule {}
