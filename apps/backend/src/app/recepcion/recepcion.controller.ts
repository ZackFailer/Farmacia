import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RecepcionService } from './recepcion.service';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { CrearLoteDto } from './dto/crear-lote.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller()
@Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.ADMIN)
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  @Get('medicamentos')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getMedicamentos(@Query('search') search?: string) {
    return this.recepcionService.getMedicamentos(search);
  }

  @Post('medicamentos')
  createMedicamento(@Body() dto: CrearMedicamentoDto) {
    return this.recepcionService.createMedicamento(dto);
  }

  @Get('lotes')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getLotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.recepcionService.getLotes(p, l);
  }

  @Post('lotes')
  createLote(@Body() dto: CrearLoteDto) {
    return this.recepcionService.createLote(dto);
  }

  @Get('lotes/:id')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getLoteById(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.getLoteById(id);
  }

  @Get('lotes/:id/qr')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getLoteQr(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.getLoteQr(id);
  }
}
