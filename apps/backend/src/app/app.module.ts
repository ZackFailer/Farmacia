import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RecepcionModule } from './recepcion/recepcion.module';
import { InventarioModule } from './inventario/inventario.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { RecetasModule } from './recetas/recetas.module';
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
import { NucleoFamiliar } from './common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from './common/entities/nucleo-familiar-miembro.entity';
import { Receta } from './common/entities/receta.entity';
import { RecetaDetalle } from './common/entities/receta-detalle.entity';
import { CreateNucleoFamiliar1741190820000 } from './common/migrations/1741190820000-CreateNucleoFamiliar';
import { AddTitularFk1741190830000 } from './common/migrations/1741190830000-AddTitularFk';
import { AddActivoAndRoles1741190840000 } from './common/migrations/1741190840000-AddActivoAndRoles';
import { CreateReceta1741190850000 } from './common/migrations/1741190850000-CreateReceta';

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
        NucleoFamiliar,
        NucleoFamiliarMiembro,
        Receta,
        RecetaDetalle,
      ],
      synchronize: true,
      migrations: [CreateNucleoFamiliar1741190820000, AddTitularFk1741190830000, AddActivoAndRoles1741190840000, CreateReceta1741190850000],
      migrationsRun: false,
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
    PacientesModule,
    RecetasModule,
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
