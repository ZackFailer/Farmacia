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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '../common/types/jwt-user.type';
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
  createMedicamento(
    @Body() dto: CrearMedicamentoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.recepcionService.createMedicamento(dto, user.sub);
  }

  @Patch('medicamentos/:id')
  updateMedicamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMedicamentoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.recepcionService.updateMedicamento(id, dto, user.sub);
  }

  @Delete('medicamentos/:id')
  @Roles(UserRole.ADMIN)
  deleteMedicamento(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionService.deleteMedicamento(id);
  }

}
