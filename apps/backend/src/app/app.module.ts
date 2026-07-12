import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { PatologiaModule } from './patologia/patologia.module';
import { NecesidadModule } from './necesidad/necesidad.module';
import { CensoModule } from './censo/censo.module';
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
import { CatalogoPatologia } from './common/entities/patologia.entity';
import { CatalogoNecesidad } from './common/entities/necesidad.entity';
import { PacientePatologia } from './common/entities/paciente-patologia.entity';
import { PacienteNecesidad } from './common/entities/paciente-necesidad.entity';
import { CreatePostgresSchema1741200000000 } from './common/migrations/1741200000000-CreatePostgresSchema';

const dbUrl = process.env.DATABASE_URL;
const dbConfig = dbUrl
  ? { url: dbUrl }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || process.env.PGUSER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
      database: process.env.DB_NAME || process.env.PGDATABASE || 'farmacia_dev',
    };

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...dbConfig,
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
        CatalogoPatologia,
        CatalogoNecesidad,
        PacientePatologia,
        PacienteNecesidad,
      ],
      synchronize: false,
      migrations: [CreatePostgresSchema1741200000000],
      migrationsRun: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
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
    PatologiaModule,
    NecesidadModule,
    CensoModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
