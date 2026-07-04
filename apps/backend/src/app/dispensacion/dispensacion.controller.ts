import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { DispensacionService } from './dispensacion.service';
import { CrearPacienteDto } from './dto/crear-paciente.dto';
import { CrearDispensacionDto } from './dto/crear-dispensacion.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';

@Controller()
export class DispensacionController {
  constructor(private readonly dispensacionService: DispensacionService) {}

  @Post('pacientes')
  createPaciente(@Body() dto: CrearPacienteDto) {
    return this.dispensacionService.createPaciente(dto);
  }

  @Get('pacientes/:idEmergencia')
  getPacienteByIdEmergencia(@Param('idEmergencia') idEmergencia: string) {
    return this.dispensacionService.getPacienteByIdEmergencia(idEmergencia);
  }

  @Get('pacientes')
  searchPacientes(@Query('q') query: string) {
    return this.dispensacionService.searchPacientes(query);
  }

  @Get('pacientes/:id/familiares')
  getFamiliares(@Param('id', ParseIntPipe) id: number) {
    return this.dispensacionService.getFamiliares(id);
  }

  @Get('lotes/disponibles/:medicamentoId')
  getLotesDisponibles(@Param('medicamentoId', ParseIntPipe) medicamentoId: number) {
    return this.dispensacionService.getLotesDisponibles(medicamentoId);
  }

  @Get('configuraciones/:medicamentoId/dosis')
  getDoseConfig(@Param('medicamentoId', ParseIntPipe) medicamentoId: number) {
    return this.dispensacionService.getDoseConfig(medicamentoId);
  }

  @Post('dispensaciones')
  createDispensacion(
    @Body() dto: CrearDispensacionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.dispensacionService.crearDispensacion(dto, user.sub);
  }
}
