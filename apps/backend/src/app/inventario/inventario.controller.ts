import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { ActualizarUmbralDto } from './dto/actualizar-umbral.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { MetricasInventario } from './dto/metricas-inventario.dto';

@Controller()
@Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('inventario')
  getInventario(@Query('search') search?: string) {
    return this.inventarioService.getInventario(search);
  }

  @Get('inventario/metricas')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getMetricas(): Promise<MetricasInventario> {
    return this.inventarioService.getMetricas();
  }

  @Get('configuraciones/umbrales')
  @Roles(UserRole.ADMIN)
  getUmbrales() {
    return this.inventarioService.getUmbrales();
  }

  @Patch('configuraciones/medicamento/:medicamentoId/umbral')
  @Roles(UserRole.ADMIN)
  actualizarUmbral(
    @Param('medicamentoId', ParseIntPipe) medicamentoId: number,
    @Body() dto: ActualizarUmbralDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.inventarioService.actualizarUmbral(medicamentoId, dto.umbralMinimo, user.sub);
  }
}
