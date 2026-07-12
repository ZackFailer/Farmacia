import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'node:path';
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
import { NodeSqliteCompat } from './common/node-sqlite-compat';
import { CreateInitialSchema1741190810000 } from './common/migrations/1741190810000-CreateInitialSchema';

const typeOrmOptions = {
  type: 'sqlite' as const,
  database: process.env.DB_PATH || join(__dirname, '..', '..', '..', 'apps', 'backend', 'data', 'farmacia.sqlite'),
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
  migrations: [CreateInitialSchema1741190810000],
  migrationsRun: true,
};

const mockSqlite = {
  verbose: () => ({
    Database: class Mock {
      constructor() {
        // stub — nunca se usa porque reemplazamos connect()
      }
      run() { return this; }
      close() { /* stub */ }
    },
  }),
};

async function createNodeSqliteDataSource(options: DataSourceOptions): Promise<DataSource> {
  const ds = new DataSource({
    ...options,
    driver: mockSqlite,
  } as unknown as DataSourceOptions);
  const driver = ds.driver as unknown as { connect: () => Promise<void>; disconnect: () => Promise<void>; databaseConnection: NodeSqliteCompat | undefined };
  driver.connect = async () => {
    driver.databaseConnection = new NodeSqliteCompat(options.database as string);
  };
  driver.disconnect = async () => {
    const compat = driver.databaseConnection;
    if (compat) {
      await new Promise<void>((resolve, reject) => {
        compat.close((err) => (err ? reject(err) : resolve()));
      });
    }
  };
  await ds.initialize();
  return ds;
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => typeOrmOptions,
      dataSourceFactory: createNodeSqliteDataSource,
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
