import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasMedicamentosController } from './estadisticas-medicamentos.controller';
import { EstadisticasMedicamentosService } from './estadisticas-medicamentos.service';
import { Paciente } from '../common/entities/paciente.entity';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { ParametroSistema } from '../common/entities/parametro-sistema.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Medicamento, Dispensacion, DispensacionDetalle, ParametroSistema]),
  ],
  controllers: [EstadisticasMedicamentosController],
  providers: [EstadisticasMedicamentosService],
})
export class EstadisticasMedicamentosModule {}
