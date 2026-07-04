import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from '../common/entities/lote.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lote, Configuracion, LoteMovimiento])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
