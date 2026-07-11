import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from '../common/entities/configuracion.entity';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { Medicamento } from '../common/entities/medicamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion, Medicamento, Dispensacion, DispensacionDetalle])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
