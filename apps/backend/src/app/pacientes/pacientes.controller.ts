import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CrearPacienteDto } from './dto/crear-paciente.dto';
import { ActualizarPacienteDto } from './dto/actualizar-paciente.dto';
import { AgregarFamiliarDto } from './dto/agregar-familiar.dto';
import { AgregarPatologiaDto } from './dto/agregar-patologia.dto';
import { AgregarNecesidadDto } from './dto/agregar-necesidad.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('pacientes')
@Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.ADMIN, UserRole.SURVEYOR)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN, UserRole.SURVEYOR)
  createPaciente(
    @Body() dto: CrearPacienteDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pacientesService.createPaciente(dto, user.sub);
  }

  @Get()
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN, UserRole.SURVEYOR)
  searchPacientes(
    @Query('q') query: string,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    return this.pacientesService.searchPacientes(query, incluirInactivos === 'true');
  }

  @Get('emergencia/:idEmergencia')
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN, UserRole.SURVEYOR)
  getPacienteByIdEmergencia(@Param('idEmergencia') idEmergencia: string) {
    return this.pacientesService.getPacienteByIdEmergencia(idEmergencia);
  }

  @Get(':id')
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN, UserRole.SURVEYOR)
  getPacienteById(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.getPacienteById(id);
  }

  @Patch(':id')
  updatePaciente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPacienteDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pacientesService.updatePaciente(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deletePaciente(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.deletePaciente(id);
  }

  @Get(':id/nucleo')
  getNucleo(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.getNucleo(id);
  }

  @Post(':id/nucleo')
  agregarFamiliar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarFamiliarDto,
  ) {
    return this.pacientesService.agregarFamiliar(id, dto);
  }

  @Delete(':id/nucleo/:miembroId')
  quitarFamiliar(
    @Param('id', ParseIntPipe) id: number,
    @Param('miembroId', ParseIntPipe) miembroId: number,
  ) {
    return this.pacientesService.quitarFamiliar(id, miembroId);
  }

  @Patch(':id/necesidades/:necId/suplida')
  @Roles(UserRole.SURVEYOR, UserRole.ADMIN)
  async marcarNecesidadSuplida(
    @Param('id', ParseIntPipe) id: number,
    @Param('necId', ParseIntPipe) necId: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pacientesService.marcarNecesidadSuplida(id, necId, user.sub);
  }

  @Post(':id/patologias')
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN, UserRole.SURVEYOR)
  async agregarPatologia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarPatologiaDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pacientesService.agregarPatologia(id, dto, user.sub);
  }

  @Delete(':id/patologias/:patologiaId')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  async quitarPatologia(
    @Param('id', ParseIntPipe) id: number,
    @Param('patologiaId', ParseIntPipe) patologiaId: number,
  ) {
    return this.pacientesService.quitarPatologia(id, patologiaId);
  }

  @Post(':id/necesidades')
  @Roles(UserRole.SURVEYOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  async agregarNecesidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarNecesidadDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pacientesService.agregarNecesidad(id, dto.necesidadId, user.sub);
  }

  @Delete(':id/necesidades/:necesidadId')
  @Roles(UserRole.SURVEYOR, UserRole.ADMIN)
  async quitarNecesidad(
    @Param('id', ParseIntPipe) id: number,
    @Param('necesidadId', ParseIntPipe) necesidadId: number,
  ) {
    return this.pacientesService.quitarNecesidad(id, necesidadId);
  }
}
