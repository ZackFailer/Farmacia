import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';
import { Usuario } from '../common/entities/usuario.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { ParametroSistema } from '../common/entities/parametro-sistema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Configuracion, ParametroSistema])],
  controllers: [AdministracionController],
  providers: [AdministracionService],
  exports: [AdministracionService],
})
export class AdministracionModule {}
