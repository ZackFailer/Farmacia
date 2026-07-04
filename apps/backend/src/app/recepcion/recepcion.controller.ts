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

@Controller()
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  @Get('medicamentos')
  getMedicamentos(@Query('search') search?: string) {
    return this.recepcionService.getMedicamentos(search);
  }

  @Post('medicamentos')
  createMedicamento(@Body() dto: CrearMedicamentoDto) {
    return this.recepcionService.createMedicamento(dto);
  }

  @Get('lotes')
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
  getLoteById(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.getLoteById(id);
  }

  @Get('lotes/:id/qr')
  getLoteQr(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.getLoteQr(id);
  }
}
