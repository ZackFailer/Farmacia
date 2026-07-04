import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AdministracionService } from './administracion.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarConfiguracionDto } from './dto/actualizar-configuracion.dto';

@Roles(UserRole.PHARMACEUTICAL)
@Controller()
export class AdministracionController {
  constructor(private readonly administracionService: AdministracionService) {}

  @Get('usuarios')
  getUsuarios() {
    return this.administracionService.getUsuarios();
  }

  @Post('usuarios')
  createUsuario(@Body() dto: CrearUsuarioDto) {
    return this.administracionService.createUsuario(dto);
  }

  @Patch('usuarios/:id')
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.administracionService.updateUsuario(id, dto);
  }

  @Delete('usuarios/:id')
  deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.administracionService.deleteUsuario(id);
  }

  @Get('configuraciones')
  getConfiguraciones() {
    return this.administracionService.getConfiguraciones();
  }

  @Patch('configuraciones/:id')
  updateConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarConfiguracionDto,
  ) {
    return this.administracionService.updateConfiguracion(id, dto);
  }
}
