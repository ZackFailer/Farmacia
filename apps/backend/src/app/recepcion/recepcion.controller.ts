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
import { RecepcionService } from './recepcion.service';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { ActualizarMedicamentoDto } from './dto/actualizar-medicamento.dto';
import { CrearLoteDto } from './dto/crear-lote.dto';
import { ActualizarLoteDto } from './dto/actualizar-lote.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller()
@Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.ADMIN)
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  @Get('medicamentos')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getMedicamentos(
    @Query('search') search?: string,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    return this.recepcionService.getMedicamentos(search, incluirInactivos === 'true');
  }

  @Post('medicamentos')
  createMedicamento(@Body() dto: CrearMedicamentoDto) {
    return this.recepcionService.createMedicamento(dto);
  }

  @Patch('medicamentos/:id')
  updateMedicamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMedicamentoDto,
  ) {
    return this.recepcionService.updateMedicamento(id, dto);
  }

  @Delete('medicamentos/:id')
  @Roles(UserRole.ADMIN)
  deleteMedicamento(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.deleteMedicamento(id);
  }

  @Get('lotes')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getLotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.recepcionService.getLotes(p, l, incluirInactivos === 'true');
  }

  @Post('lotes')
  createLote(@Body() dto: CrearLoteDto) {
    return this.recepcionService.createLote(dto);
  }

  @Patch('lotes/:id')
  updateLote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarLoteDto,
  ) {
    return this.recepcionService.updateLote(id, dto);
  }

  @Delete('lotes/:id')
  @Roles(UserRole.ADMIN)
  deleteLote(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.deleteLote(id);
  }

  @Get('lotes/qr/:codigo')
  @Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)
  getLoteByQR(@Param('codigo') codigo: string) {
    return this.recepcionService.getLoteByQR(codigo);
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
