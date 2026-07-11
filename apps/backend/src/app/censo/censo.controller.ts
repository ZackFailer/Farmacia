import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CensoService } from './censo.service';
import { CrearCarpaDto } from './dto/crear-carpa.dto';
import { ActualizarCarpaDto } from './dto/actualizar-carpa.dto';
import { AgregarMiembroCarpaDto } from './dto/agregar-miembro-carpa.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import type { ExportarCensoResponse } from './dto/exportar-censo.dto';

@Controller('censo')
export class CensoController {
  constructor(private readonly censoService: CensoService) {}

  @Get('estadisticas')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  getEstadisticas() {
    return this.censoService.getEstadisticas();
  }

  @Get('exportar')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  async exportarCenso(): Promise<ExportarCensoResponse> {
    return this.censoService.exportarCenso();
  }

  @Post('carpas')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  crearCarpa(
    @Body() dto: CrearCarpaDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.censoService.crearCarpa(dto, user.sub);
  }

  @Get('carpas')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  listarCarpas() {
    return this.censoService.listarCarpas();
  }

  @Get('carpas/:codigo')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  getCarpaByCodigo(@Param('codigo') codigo: string) {
    return this.censoService.getCarpaByCodigo(codigo);
  }

  @Patch('carpas/:codigo')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  actualizarCarpa(
    @Param('codigo') codigo: string,
    @Body() dto: ActualizarCarpaDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.censoService.actualizarCarpa(codigo, dto, user.sub);
  }

  @Delete('carpas/:codigo')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  eliminarCarpa(@Param('codigo') codigo: string) {
    return this.censoService.eliminarCarpa(codigo);
  }

  @Post('carpas/:codigo/miembros')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  agregarMiembro(
    @Param('codigo') codigo: string,
    @Body() dto: AgregarMiembroCarpaDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.censoService.agregarMiembroCarpa(codigo, dto, user.sub);
  }
}
