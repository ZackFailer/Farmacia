import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RecepcionModule } from './recepcion/recepcion.module';
import { InventarioModule } from './inventario/inventario.module';
import { DispensacionModule } from './dispensacion/dispensacion.module';
import { HistorialModule } from './historial/historial.module';
import { AdministracionModule } from './administracion/administracion.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CommonModule } from './common/common.module';
import { Usuario } from './common/entities/usuario.entity';
import { Medicamento } from './common/entities/medicamento.entity';
import { Lote } from './common/entities/lote.entity';
import { Paciente } from './common/entities/paciente.entity';
import { Dispensacion } from './common/entities/dispensacion.entity';
import { DispensacionDetalle } from './common/entities/dispensacion-detalle.entity';
import { Configuracion } from './common/entities/configuracion.entity';
import { LoteMovimiento } from './common/entities/lote-movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'apps/backend/data/farmacia.sqlite',
      entities: [
        Usuario,
        Medicamento,
        Lote,
        Paciente,
        Dispensacion,
        DispensacionDetalle,
        Configuracion,
        LoteMovimiento,
      ],
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'apopharma-dev-secret',
      signOptions: {},
    }),
    CommonModule,
    AuthModule,
    RecepcionModule,
    InventarioModule,
    DispensacionModule,
    HistorialModule,
    AdministracionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
