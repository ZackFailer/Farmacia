import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicamento } from '../common/entities/medicamento.entity';
import { RecepcionController } from './recepcion.controller';
import { RecepcionService } from './recepcion.service';
import { Configuracion } from '../common/entities/configuracion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicamento, Configuracion]),
  ],
  controllers: [RecepcionController],
  providers: [RecepcionService],
  exports: [RecepcionService],
})
export class RecepcionModule {}
