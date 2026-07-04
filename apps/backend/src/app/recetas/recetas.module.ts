import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasController } from './recetas.controller';
import { RecetasService } from './recetas.service';
import { Receta } from '../common/entities/receta.entity';
import { RecetaDetalle } from '../common/entities/receta-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receta, RecetaDetalle])],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService],
})
export class RecetasModule {}
