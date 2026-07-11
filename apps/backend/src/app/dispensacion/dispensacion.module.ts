import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispensacionController } from './dispensacion.controller';
import { DispensacionService } from './dispensacion.service';
import { RecetasModule } from '../recetas/recetas.module';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Lote } from '../common/entities/lote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Configuracion,
      Dispensacion,
      DispensacionDetalle,
      Medicamento,
      Lote,
    ]),
    RecetasModule,
  ],
  controllers: [DispensacionController],
  providers: [DispensacionService],
  exports: [DispensacionService],
})
export class DispensacionModule {}
