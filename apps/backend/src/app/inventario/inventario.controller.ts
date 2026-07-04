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
import { AjustarStockDto } from './dto/ajustar-stock.dto';
import { ActualizarUmbralDto } from './dto/actualizar-umbral.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';

@Controller()
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('inventario')
  getInventario(@Query('search') search?: string) {
    return this.inventarioService.getInventario(search);
  }

  @Get('inventario/proximos-vencer')
  getProximosVencer() {
    return this.inventarioService.getProximosVencer();
  }

  @Patch('lotes/:id/ajustar-stock')
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjustarStockDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.inventarioService.ajustarStock(
      id,
      dto.cantidadReal,
      user.sub,
      dto.motivo,
    );
  }

  @Get('lotes/:id/movimientos')
  getMovimientos(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.getMovimientosLote(id);
  }

  @Get('configuraciones/umbrales')
  getUmbrales() {
    return this.inventarioService.getUmbrales();
  }

  @Patch('configuraciones/:id/umbral')
  actualizarUmbral(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUmbralDto,
  ) {
    return this.inventarioService.actualizarUmbral(id, dto.umbralMinimo);
  }
}
