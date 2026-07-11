import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DispensacionService } from './dispensacion.service';
import { RecetasService } from '../recetas/recetas.service';
import { CrearDispensacionDto } from './dto/crear-dispensacion.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { JwtUser } from '../common/types/jwt-user.type';

@Controller()
@Roles(UserRole.PHARMACEUTICAL, UserRole.ADMIN)
export class DispensacionController {
  constructor(
    private readonly dispensacionService: DispensacionService,
    private readonly recetasService: RecetasService,
  ) {}

  @Get('dispensaciones/pendientes')
  getRecetasPendientes() {
    return this.recetasService.getRecetasPendientes();
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
