import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CrearRecetaDto } from './dto/crear-receta.dto';
import { ActualizarEstadoRecetaDto } from './dto/actualizar-estado-receta.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';

@Controller('recetas')
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  createReceta(@Body() dto: CrearRecetaDto, @CurrentUser() user: JwtUser) {
    return this.recetasService.createReceta(dto, user.sub);
  }

  @Get('pendientes')
  @Roles(UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getPendientes() {
    return this.recetasService.getRecetasPendientes();
  }

  @Get('paciente/:pacienteId')
  @Roles(UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.recetasService.getRecetasByPaciente(pacienteId);
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getReceta(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.getReceta(id);
  }

  @Patch(':id/estado')
  @Roles(UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoRecetaDto,
  ) {
    return this.recetasService.updateEstado(id, dto);
  }
}
