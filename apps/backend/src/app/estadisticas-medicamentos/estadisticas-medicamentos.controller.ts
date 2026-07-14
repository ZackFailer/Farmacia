import { Controller, Get } from '@nestjs/common';
import { EstadisticasMedicamentosService } from './estadisticas-medicamentos.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('medicamentos')
export class EstadisticasMedicamentosController {
  constructor(private readonly service: EstadisticasMedicamentosService) {}

  @Get('estadisticas')
  @Roles(UserRole.PHARMACEUTICAL, UserRole.MEDICATION_RECEPTIONIST, UserRole.DOCTOR, UserRole.ADMIN)
  getEstadisticas() {
    return this.service.getEstadisticas();
  }
}
