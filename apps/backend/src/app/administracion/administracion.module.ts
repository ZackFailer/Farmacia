import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';
import { Usuario } from '../common/entities/usuario.entity';
import { Configuracion } from '../common/entities/configuracion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Configuracion])],
  controllers: [AdministracionController],
  providers: [AdministracionService],
  exports: [AdministracionService],
})
export class AdministracionModule {}
