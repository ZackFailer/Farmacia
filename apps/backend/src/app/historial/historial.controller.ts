import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistorialService } from './historial.service';

@Controller()
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get('pacientes/:idEmergencia/dispensaciones')
  getHistorialPaciente(@Param('idEmergencia') idEmergencia: string) {
    return this.historialService.getHistorialPaciente(idEmergencia);
  }

  @Get('dispensaciones/:id')
  getDetalleDispensacion(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.getDetalleDispensacion(id);
  }
}
