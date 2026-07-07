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
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('pacientes')
@Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.ADMIN, UserRole.SURVEYOR)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  createPaciente(@Body() dto: CrearPacienteDto) {
    return this.pacientesService.createPaciente(dto);
  }

  @Get()
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  searchPacientes(
    @Query('q') query: string,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    return this.pacientesService.searchPacientes(query, incluirInactivos === 'true');
  }

  @Get('emergencia/:idEmergencia')
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getPacienteByIdEmergencia(@Param('idEmergencia') idEmergencia: string) {
    return this.pacientesService.getPacienteByIdEmergencia(idEmergencia);
  }

  @Get(':id')
  @Roles(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getPacienteById(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.getPacienteById(id);
  }

  @Patch(':id')
  updatePaciente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPacienteDto,
  ) {
    return this.pacientesService.updatePaciente(id, dto);
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
}
